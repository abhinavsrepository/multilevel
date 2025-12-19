const express = require('express');
const router = express.Router();
const supportTicketController = require('../controllers/support-ticket.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// Stats endpoint
router.get('/tickets/stats', supportTicketController.getTicketStats);

// Ticket CRUD
router.post('/tickets', supportTicketController.createTicket);
router.get('/tickets', supportTicketController.getTickets);
router.get('/tickets/:ticketId', supportTicketController.getTicketById);
router.post('/tickets/:ticketId/reply', supportTicketController.replyToTicket);

// Admin only
router.put('/tickets/:ticketId/status', authorize('ADMIN'), supportTicketController.updateTicketStatus);

module.exports = router;
