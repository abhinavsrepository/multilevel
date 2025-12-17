const express = require('express');
const router = express.Router();
const supportTicketController = require('../controllers/support-ticket.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', supportTicketController.createTicket);
router.get('/', supportTicketController.getTickets);
router.get('/:ticketId', supportTicketController.getTicketById);
router.post('/:ticketId/reply', supportTicketController.replyToTicket);

// Admin only
router.put('/:ticketId/status', authorize('ADMIN'), supportTicketController.updateTicketStatus);

module.exports = router;
