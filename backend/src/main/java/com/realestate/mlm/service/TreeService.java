package com.realestate.mlm.service;

import com.realestate.mlm.dto.response.TreeNodeResponse;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.exception.TreePlacementException;
import com.realestate.mlm.model.User;
import com.realestate.mlm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TreeService {

    private final UserRepository userRepository;

    /**
     * Find placement position in binary tree
     * Returns array: [placementUser, position ("LEFT" or "RIGHT")]
     */
    public User[] findPlacementPosition(String sponsorId, String placement) {
        log.info("Finding placement position for sponsor: {}, placement: {}", sponsorId, placement);

        User sponsor = userRepository.findByUserId(sponsorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor not found with userId: " + sponsorId));

        if ("AUTO".equalsIgnoreCase(placement)) {
            return autoPlacement(sponsorId);
        } else if ("LEFT".equalsIgnoreCase(placement)) {
            return findPositionInLeg(sponsor, "LEFT");
        } else if ("RIGHT".equalsIgnoreCase(placement)) {
            return findPositionInLeg(sponsor, "RIGHT");
        } else {
            throw new TreePlacementException("Invalid placement option: " + placement);
        }
    }

    /**
     * Auto placement - breadth-first search to find first available position
     */
    public User[] autoPlacement(String sponsorId) {
        log.info("Auto placement for sponsor: {}", sponsorId);

        User sponsor = userRepository.findByUserId(sponsorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor not found with userId: " + sponsorId));

        // BFS to find first available position
        Queue<User> queue = new LinkedList<>();
        queue.offer(sponsor);

        while (!queue.isEmpty()) {
            User current = queue.poll();

            // Check left position
            List<User> leftChildren = userRepository.findByPlacementUserAndPlacement(current, "LEFT");
            if (leftChildren.isEmpty()) {
                log.info("Found available LEFT position under user: {}", current.getUserId());
                return new User[] { current, createPositionUser("LEFT") };
            } else {
                queue.offer(leftChildren.get(0));
            }

            // Check right position
            List<User> rightChildren = userRepository.findByPlacementUserAndPlacement(current, "RIGHT");
            if (rightChildren.isEmpty()) {
                log.info("Found available RIGHT position under user: {}", current.getUserId());
                return new User[] { current, createPositionUser("RIGHT") };
            } else {
                queue.offer(rightChildren.get(0));
            }
        }

        throw new TreePlacementException("No available position found in tree");
    }

    /**
     * Find position in specific leg (LEFT or RIGHT)
     */
    private User[] findPositionInLeg(User sponsor, String leg) {
        log.info("Finding position in {} leg for sponsor: {}", leg, sponsor.getUserId());

        User current = sponsor;

        while (true) {
            List<User> children = userRepository.findByPlacementUserAndPlacement(current, leg);

            if (children.isEmpty()) {
                // Found empty spot
                log.info("Found available {} position under user: {}", leg, current.getUserId());
                return new User[] { current, createPositionUser(leg) };
            } else {
                // Move down to child
                current = children.get(0);
            }
        }
    }

    /**
     * Helper method to create a User object representing position
     */
    private User createPositionUser(String position) {
        User user = new User();
        user.setUserId(position);
        return user;
    }

    /**
     * Build binary tree response recursively up to specified depth
     */
    public TreeNodeResponse getBinaryTree(String userId, int depth) {
        log.info("Building binary tree for user: {}, depth: {}", userId, depth);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        return buildTreeNode(user, 0, depth);
    }

    /**
     * Recursively build tree node
     */
    private TreeNodeResponse buildTreeNode(User user, int currentDepth, int maxDepth) {
        TreeNodeResponse node = TreeNodeResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .status(user.getStatus())
                .totalInvestment(user.getTotalInvestment())
                .level(user.getLevel())
                .position(getPositionOfUser(user))
                .build();

        // Stop if max depth reached
        if (currentDepth >= maxDepth) {
            return node;
        }

        // Get left child
        List<User> leftChildren = userRepository.findByPlacementUserAndPlacement(user, "LEFT");
        if (!leftChildren.isEmpty()) {
            node.setLeftChild(buildTreeNode(leftChildren.get(0), currentDepth + 1, maxDepth));
        }

        // Get right child
        List<User> rightChildren = userRepository.findByPlacementUserAndPlacement(user, "RIGHT");
        if (!rightChildren.isEmpty()) {
            node.setRightChild(buildTreeNode(rightChildren.get(0), currentDepth + 1, maxDepth));
        }

        return node;
    }

    /**
     * Get position of user in their placement parent's tree
     */
    private String getPositionOfUser(User user) {
        if (user.getPlacementUser() == null) {
            return "ROOT";
        }
        return user.getPlacement();
    }

    /**
     * Update uplines' BV (Business Volume) when a user makes investment
     */
    @Transactional
    public void updateUplinesBV(User user, BigDecimal bv, String leg) {
        log.info("Updating uplines BV for user: {}, BV: {}, leg: {}", user.getUserId(), bv, leg);

        User current = user.getPlacementUser();
        String currentLeg = user.getPlacement();

        while (current != null) {
            // Update BV based on leg
            if ("LEFT".equals(currentLeg)) {
                current.setLeftBv(current.getLeftBv().add(bv));
            } else if ("RIGHT".equals(currentLeg)) {
                current.setRightBv(current.getRightBv().add(bv));
            }

            // Update team BV
            current.setTeamBv(current.getTeamBv().add(bv));

            // Save user
            userRepository.save(current);
            log.debug("Updated BV for user: {}, Left: {}, Right: {}",
                    current.getUserId(), current.getLeftBv(), current.getRightBv());

            // Move to next upline
            currentLeg = current.getPlacement();
            current = current.getPlacementUser();
        }

        log.info("Uplines BV update completed");
    }

    /**
     * Calculate total team BV (sum of all downline BV)
     */
    public BigDecimal calculateTeamBV(String userId) {
        log.info("Calculating team BV for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        BigDecimal totalBV = user.getPersonalBv();
        totalBV = totalBV.add(calculateDownlineBV(user));

        log.info("Total team BV for user {}: {}", userId, totalBV);
        return totalBV;
    }

    /**
     * Recursively calculate downline BV
     */
    private BigDecimal calculateDownlineBV(User user) {
        BigDecimal totalBV = BigDecimal.ZERO;

        // Get left children
        List<User> leftChildren = userRepository.findByPlacementUserAndPlacement(user, "LEFT");
        for (User child : leftChildren) {
            totalBV = totalBV.add(child.getPersonalBv());
            totalBV = totalBV.add(calculateDownlineBV(child));
        }

        // Get right children
        List<User> rightChildren = userRepository.findByPlacementUserAndPlacement(user, "RIGHT");
        for (User child : rightChildren) {
            totalBV = totalBV.add(child.getPersonalBv());
            totalBV = totalBV.add(calculateDownlineBV(child));
        }

        return totalBV;
    }

    /**
     * Get tree statistics (left BV, right BV, total BV, carry forward)
     */
    /**
     * Get tree statistics
     */
    public com.realestate.mlm.dto.response.TreeStatsResponse getTreeStats(String userId) {
        log.info("Getting tree stats for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Calculate leg counts
        int leftLegCount = calculateLegCount(user, "LEFT");
        int rightLegCount = calculateLegCount(user, "RIGHT");

        // Calculate team stats
        List<User> downline = getAllDownlineUsers(userId);
        int activeMembers = (int) downline.stream().filter(u -> "ACTIVE".equals(u.getStatus())).count();
        int inactiveMembers = downline.size() - activeMembers;

        BigDecimal teamInvestment = downline.stream()
                .map(User::getTotalInvestment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Direct referrals
        Long directReferrals = userRepository.countBySponsorId(userId);

        // This month stats
        java.time.LocalDateTime startOfMonth = java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long directReferralsThisMonth = userRepository.findBySponsorId(userId).stream()
                .filter(u -> u.getCreatedAt().isAfter(startOfMonth))
                .count();

        BigDecimal teamInvestmentThisMonth = downline.stream()
                .filter(u -> u.getCreatedAt().isAfter(startOfMonth))
                .map(User::getTotalInvestment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return com.realestate.mlm.dto.response.TreeStatsResponse.builder()
                .totalTeam(downline.size())
                .leftLegCount(leftLegCount)
                .rightLegCount(rightLegCount)
                .activeMembers(activeMembers)
                .inactiveMembers(inactiveMembers)
                .directReferrals(directReferrals.intValue())
                .directReferralsThisMonth((int) directReferralsThisMonth)
                .teamBV(user.getTeamBv())
                .leftBV(user.getLeftBv())
                .rightBV(user.getRightBv())
                .matchingBV(BigDecimal.ZERO)
                .carryForward(user.getCarryForwardLeft().add(user.getCarryForwardRight()))
                .teamInvestment(teamInvestment)
                .teamInvestmentThisMonth(teamInvestmentThisMonth)
                .maxDepth(getTreeDepth(userId))
                .placementStatus(user.getPlacement())
                .build();
    }

    private int calculateLegCount(User user, String leg) {
        List<User> children = userRepository.findByPlacementUserAndPlacement(user, leg);
        if (children.isEmpty()) {
            return 0;
        }
        User child = children.get(0);
        return getAllDownlineUsers(child.getUserId()).size() + 1;
    }

    /**
     * Get all downline users (team members)
     */
    public List<User> getAllDownlineUsers(String userId) {
        log.info("Getting all downline users for: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        List<User> downline = new ArrayList<>();
        collectDownlineUsers(user, downline);

        log.info("Total downline users for {}: {}", userId, downline.size());
        return downline;
    }

    /**
     * Recursively collect all downline users
     */
    private void collectDownlineUsers(User user, List<User> downline) {
        // Get left children
        List<User> leftChildren = userRepository.findByPlacementUserAndPlacement(user, "LEFT");
        for (User child : leftChildren) {
            downline.add(child);
            collectDownlineUsers(child, downline);
        }

        // Get right children
        List<User> rightChildren = userRepository.findByPlacementUserAndPlacement(user, "RIGHT");
        for (User child : rightChildren) {
            downline.add(child);
            collectDownlineUsers(child, downline);
        }
    }

    /**
     * Get tree depth for a user
     */
    public int getTreeDepth(String userId) {
        log.info("Calculating tree depth for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        int depth = calculateDepth(user);
        log.info("Tree depth for user {}: {}", userId, depth);
        return depth;
    }

    /**
     * Recursively calculate tree depth
     */
    private int calculateDepth(User user) {
        List<User> leftChildren = userRepository.findByPlacementUserAndPlacement(user, "LEFT");
        List<User> rightChildren = userRepository.findByPlacementUserAndPlacement(user, "RIGHT");

        int leftDepth = 0;
        int rightDepth = 0;

        if (!leftChildren.isEmpty()) {
            leftDepth = 1 + calculateDepth(leftChildren.get(0));
        }

        if (!rightChildren.isEmpty()) {
            rightDepth = 1 + calculateDepth(rightChildren.get(0));
        }

        return Math.max(leftDepth, rightDepth);
    }

    /**
     * Verify tree integrity (check for orphans, invalid placements)
     */
    public Map<String, Object> verifyTreeIntegrity(String userId) {
        log.info("Verifying tree integrity for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Map<String, Object> result = new HashMap<>();
        List<String> issues = new ArrayList<>();

        verifyNodeIntegrity(user, issues);

        result.put("valid", issues.isEmpty());
        result.put("issues", issues);
        result.put("totalNodes", getAllDownlineUsers(userId).size() + 1);

        return result;
    }

    /**
     * Recursively verify node integrity
     */
    private void verifyNodeIntegrity(User user, List<String> issues) {
        // Check left child
        List<User> leftChildren = userRepository.findByPlacementUserAndPlacement(user, "LEFT");
        if (leftChildren.size() > 1) {
            issues.add("User " + user.getUserId() + " has multiple LEFT children");
        }
        if (!leftChildren.isEmpty()) {
            User leftChild = leftChildren.get(0);
            if (!leftChild.getPlacementUser().getId().equals(user.getId())) {
                issues.add("LEFT child " + leftChild.getUserId() + " has invalid placement parent");
            }
            verifyNodeIntegrity(leftChild, issues);
        }

        // Check right child
        List<User> rightChildren = userRepository.findByPlacementUserAndPlacement(user, "RIGHT");
        if (rightChildren.size() > 1) {
            issues.add("User " + user.getUserId() + " has multiple RIGHT children");
        }
        if (!rightChildren.isEmpty()) {
            User rightChild = rightChildren.get(0);
            if (!rightChild.getPlacementUser().getId().equals(user.getId())) {
                issues.add("RIGHT child " + rightChild.getUserId() + " has invalid placement parent");
            }
            verifyNodeIntegrity(rightChild, issues);
        }
    }

    /**
     * Get upline chain (all ancestors up to root)
     */
    public List<User> getUplineChain(String userId) {
        log.info("Getting upline chain for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        List<User> upline = new ArrayList<>();
        User current = user.getPlacementUser();

        while (current != null) {
            upline.add(current);
            current = current.getPlacementUser();
        }

        log.info("Upline chain length for {}: {}", userId, upline.size());
        return upline;
    }

    /**
     * Get sponsor chain (all sponsors up to root)
     */
    public List<User> getSponsorChain(String userId) {
        log.info("Getting sponsor chain for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        List<User> sponsors = new ArrayList<>();
        User current = user.getSponsor();

        while (current != null) {
            sponsors.add(current);
            current = current.getSponsor();
        }

        log.info("Sponsor chain length for {}: {}", userId, sponsors.size());
        return sponsors;
    }
}
