const { SupportTicket, TicketReply, User } = require('../models');
const notificationService = require('../services/notification.service');
const { v4: uuidv4 } = require('uuid');

exports.createTicket = async (req, res) => {
    try {
        const { subject, message, category, priority } = req.body;
        const userId = req.user.id;

        const ticket = await SupportTicket.create({
            id: uuidv4(), // Or generate a shorter ID like TKT-12345
            userId,
            subject,
            message,
            category,
            priority,
            status: 'OPEN'
        });

        await notificationService.sendNotification(userId, 'Ticket Created', `Your ticket #${ticket.id} has been created.`, 'SUPPORT');

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            data: ticket
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.replyToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        const { ticketId } = req.params;
        const userId = req.user.id;

        const ticket = await SupportTicket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if (ticket.userId !== userId && req.user.role !== 'ADMIN') { // Assuming role check
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (ticket.status === 'CLOSED') {
            return res.status(400).json({ success: false, message: 'Ticket is closed' });
        }

        const reply = await TicketReply.create({
            ticketId,
            userId,
            message,
            isAdminReply: req.user.role === 'ADMIN'
        });

        // Update ticket status if needed (e.g., if admin replies, set to RESOLVED or waiting for user)
        // For now, just keep it as is or update updated_at

        if (req.user.role === 'ADMIN') {
            await notificationService.sendNotification(ticket.userId, 'Ticket Reply', `New reply on ticket #${ticket.id}`, 'SUPPORT');
        }

        res.json({
            success: true,
            message: 'Reply added successfully',
            data: reply
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body; // Or query param as per Java controller
        const { ticketId } = req.params;

        const ticket = await SupportTicket.findByPk(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        await ticket.update({ status });

        await notificationService.sendNotification(ticket.userId, 'Ticket Status Updated', `Ticket #${ticket.id} status updated to ${status}`, 'SUPPORT');

        res.json({
            success: true,
            message: 'Ticket status updated successfully',
            data: 'Ticket status updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTickets = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const userId = req.user.id;

        const where = {};
        if (req.user.role !== 'ADMIN') {
            where.userId = userId;
        }

        const { count, rows } = await SupportTicket.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;

        const ticket = await SupportTicket.findByPk(ticketId, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName']
                },
                {
                    model: TicketReply,
                    as: 'replies',
                    include: [{ model: User, attributes: ['id', 'username', 'firstName', 'lastName'] }]
                }
            ]
        });

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if (ticket.userId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTicketStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const where = {};
        if (req.user.role !== 'ADMIN') {
            where.userId = userId;
        }

        const total = await SupportTicket.count({ where });
        const open = await SupportTicket.count({ where: { ...where, status: 'OPEN' } });
        const inProgress = await SupportTicket.count({ where: { ...where, status: 'IN_PROGRESS' } });
        const resolved = await SupportTicket.count({ where: { ...where, status: 'RESOLVED' } });
        const closed = await SupportTicket.count({ where: { ...where, status: 'CLOSED' } });

        res.json({
            success: true,
            data: {
                total,
                open,
                inProgress,
                resolved,
                closed
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
