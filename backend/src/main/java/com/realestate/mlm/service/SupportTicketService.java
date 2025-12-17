package com.realestate.mlm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.mlm.dto.request.TicketCreateRequest;
import com.realestate.mlm.dto.request.TicketReplyRequest;
import com.realestate.mlm.dto.response.SupportTicketResponse;
import com.realestate.mlm.dto.response.TicketReplyResponse;
import com.realestate.mlm.exception.BadRequestException;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.model.SupportTicket;
import com.realestate.mlm.model.TicketReply;
import com.realestate.mlm.model.User;
import com.realestate.mlm.repository.SupportTicketRepository;
import com.realestate.mlm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    /**
     * Create support ticket
     */
    @Transactional
    public SupportTicketResponse createTicket(TicketCreateRequest request, String userId) {
        log.info("Creating support ticket for user: {}, category: {}", userId, request.getCategory());

        // Find user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Create ticket
        SupportTicket ticket = new SupportTicket();
        ticket.setTicketId(generateTicketId());
        ticket.setUser(user);
        ticket.setSubject(request.getSubject());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        ticket.setDescription(request.getDescription());
        ticket.setStatus("OPEN");

        // Handle attachments if any
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            try {
                ticket.setAttachments(objectMapper.writeValueAsString(request.getAttachments()));
            } catch (Exception e) {
                log.error("Error serializing attachments: ", e);
            }
        }

        SupportTicket savedTicket = ticketRepository.save(ticket);

        // Send notification to admin
        notificationService.sendTicketCreatedNotification(
                user.getEmail(),
                user.getFullName(),
                ticket.getTicketId(),
                ticket.getSubject()
        );

        log.info("Support ticket created: {}", savedTicket.getTicketId());

        return mapToResponse(savedTicket);
    }

    /**
     * Get user's tickets
     */
    public Page<SupportTicketResponse> getMyTickets(String userId, Pageable pageable) {
        log.info("Fetching tickets for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Page<SupportTicket> tickets = ticketRepository.findByUser(user, pageable);

        return tickets.map(this::mapToResponse);
    }

    /**
     * Get all tickets with filters (Admin)
     */
    public Page<SupportTicketResponse> getAllTickets(Pageable pageable, String status, String category) {
        log.info("Fetching all tickets - status: {}, category: {}", status, category);

        Specification<SupportTicket> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (category != null && !category.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<SupportTicket> tickets = ticketRepository.findAll(spec, pageable);

        return tickets.map(this::mapToResponse);
    }

    /**
     * Get ticket by ID with replies
     */
    public SupportTicketResponse getTicketById(String ticketId) {
        log.info("Fetching ticket by ID: {}", ticketId);

        SupportTicket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        SupportTicketResponse response = mapToResponse(ticket);

        // Get replies
        List<TicketReply> replies = entityManager
                .createQuery("SELECT tr FROM TicketReply tr WHERE tr.ticket.id = :ticketId ORDER BY tr.createdAt ASC", TicketReply.class)
                .setParameter("ticketId", ticket.getId())
                .getResultList();

        response.setReplies(replies.stream()
                .map(this::mapReplyToResponse)
                .collect(Collectors.toList()));

        return response;
    }

    /**
     * Reply to ticket
     */
    @Transactional
    public TicketReplyResponse replyToTicket(TicketReplyRequest request, String userId) {
        log.info("Adding reply to ticket: {} by user: {}", request.getTicketId(), userId);

        // Find user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Find ticket
        SupportTicket ticket = ticketRepository.findByTicketId(request.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + request.getTicketId()));

        // Check if ticket is closed
        if ("CLOSED".equals(ticket.getStatus())) {
            throw new BadRequestException("Cannot reply to closed ticket. Please reopen it first.");
        }

        // Create reply
        TicketReply reply = new TicketReply();
        reply.setTicket(ticket);
        reply.setUser(user);
        reply.setMessage(request.getMessage());
        reply.setIsAdmin("ADMIN".equals(user.getRole()) || "MANAGER".equals(user.getRole()));
        reply.setIsInternal(false);

        // Handle attachments if any
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            try {
                reply.setAttachments(objectMapper.writeValueAsString(request.getAttachments()));
            } catch (Exception e) {
                log.error("Error serializing attachments: ", e);
            }
        }

        // Save reply using native query since TicketReplyRepository might not exist
        entityManager.persist(reply);

        // Update ticket status
        if (reply.getIsAdmin()) {
            ticket.setStatus("WAITING_RESPONSE");
        } else {
            ticket.setStatus("PENDING_USER");
        }
        ticketRepository.save(ticket);

        // Send notification
        if (reply.getIsAdmin()) {
            // Notify user
            notificationService.sendTicketReplyNotification(
                    ticket.getUser().getEmail(),
                    ticket.getUser().getFullName(),
                    ticket.getTicketId(),
                    ticket.getSubject()
            );
        } else {
            // Notify admin
            notificationService.sendTicketUserReplyNotification(
                    "admin@realestate-mlm.com",
                    ticket.getTicketId(),
                    ticket.getSubject()
            );
        }

        log.info("Reply added to ticket: {}", ticket.getTicketId());

        return mapReplyToResponse(reply);
    }

    /**
     * Update ticket status
     */
    @Transactional
    public SupportTicketResponse updateTicketStatus(String ticketId, String status) {
        log.info("Updating ticket status: {} to: {}", ticketId, status);

        SupportTicket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        // Validate status
        List<String> validStatuses = List.of("OPEN", "IN_PROGRESS", "PENDING_USER", "WAITING_RESPONSE", "RESOLVED", "CLOSED", "REOPENED");
        if (!validStatuses.contains(status)) {
            throw new BadRequestException("Invalid ticket status: " + status);
        }

        ticket.setStatus(status);

        // Set timestamps based on status
        if ("RESOLVED".equals(status)) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if ("CLOSED".equals(status)) {
            ticket.setClosedAt(LocalDateTime.now());
        } else if ("REOPENED".equals(status)) {
            ticket.setResolvedAt(null);
            ticket.setClosedAt(null);
        }

        SupportTicket updatedTicket = ticketRepository.save(ticket);

        // Send notification if resolved or closed
        if ("RESOLVED".equals(status) || "CLOSED".equals(status)) {
            notificationService.sendTicketStatusUpdateNotification(
                    ticket.getUser().getEmail(),
                    ticket.getUser().getFullName(),
                    ticket.getTicketId(),
                    status
            );
        }

        log.info("Ticket status updated: {} to {}", ticketId, status);

        return mapToResponse(updatedTicket);
    }

    /**
     * Assign ticket to admin
     */
    @Transactional
    public SupportTicketResponse assignTicket(String ticketId, Long adminId) {
        log.info("Assigning ticket: {} to admin: {}", ticketId, adminId);

        SupportTicket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        // Validate admin role
        if (!"ADMIN".equals(admin.getRole()) && !"MANAGER".equals(admin.getRole())) {
            throw new BadRequestException("User is not an admin or manager");
        }

        ticket.setAssignedTo(admin);
        ticket.setAssignedAt(LocalDateTime.now());

        // Update status to IN_PROGRESS
        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        }

        SupportTicket assignedTicket = ticketRepository.save(ticket);

        log.info("Ticket assigned: {} to admin: {}", ticketId, admin.getFullName());

        return mapToResponse(assignedTicket);
    }

    /**
     * Generate unique ticket ID
     */
    private String generateTicketId() {
        return "TKT" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    /**
     * Parse attachments JSON
     */
    private List<String> parseAttachments(String attachmentsJson) {
        try {
            if (attachmentsJson == null || attachmentsJson.isEmpty()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(attachmentsJson, objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            log.error("Error parsing attachments JSON: ", e);
            return new ArrayList<>();
        }
    }

    /**
     * Map SupportTicket to SupportTicketResponse
     */
    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        return SupportTicketResponse.builder()
                .ticketId(ticket.getTicketId())
                .userId(ticket.getUser().getUserId())
                .userName(ticket.getUser().getFullName())
                .subject(ticket.getSubject())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .attachments(parseAttachments(ticket.getAttachments()))
                .assignedToName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName() : null)
                .assignedAt(ticket.getAssignedAt())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    /**
     * Map TicketReply to TicketReplyResponse
     */
    private TicketReplyResponse mapReplyToResponse(TicketReply reply) {
        return TicketReplyResponse.builder()
                .id(reply.getId())
                .userId(reply.getUser().getUserId())
                .userName(reply.getUser().getFullName())
                .message(reply.getMessage())
                .attachments(parseAttachments(reply.getAttachments()))
                .isAdmin(reply.getIsAdmin())
                .isInternal(reply.getIsInternal())
                .createdAt(reply.getCreatedAt())
                .build();
    }
}
