const { User, Investment, Property, Installment, sequelize } = require('../models');

exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Investment.findAll({
            where: { userId },
            include: [
                { model: Property },
                { model: User, attributes: ['fullName'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const formattedBookings = bookings.map(inv => ({
            id: inv.id,
            bookingNumber: inv.investmentId,
            clientId: inv.userId,
            clientName: inv.User ? inv.User.fullName : 'Unknown',
            propertyId: inv.propertyId,
            propertyTitle: inv.Property ? inv.Property.title : 'Unknown',
            bookingAmount: parseFloat(inv.investmentAmount),
            totalAmount: parseFloat(inv.investmentAmount),
            paidAmount: parseFloat(inv.totalPaid),
            balanceAmount: parseFloat(inv.pendingAmount),
            bookingDate: inv.createdAt,
            status: inv.bookingStatus || 'CONFIRMED',
            emiSchedule: [],
            documents: [],
            createdAt: inv.createdAt,
            updatedAt: inv.updatedAt
        }));

        res.json(formattedBookings);
    } catch (error) {
        console.error('Get My Bookings Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMyBookingById = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookingId = req.params.id;

        const booking = await Investment.findOne({
            where: { id: bookingId, userId },
            include: [
                { model: Property },
                { model: User, attributes: ['fullName'] }
            ]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const formattedBooking = {
            id: booking.id,
            bookingNumber: booking.investmentId,
            clientId: booking.userId,
            clientName: booking.User ? booking.User.fullName : 'Unknown',
            propertyId: booking.propertyId,
            propertyTitle: booking.Property ? booking.Property.title : 'Unknown',
            bookingAmount: parseFloat(booking.investmentAmount),
            totalAmount: parseFloat(booking.investmentAmount),
            paidAmount: parseFloat(booking.totalPaid),
            balanceAmount: parseFloat(booking.pendingAmount),
            bookingDate: booking.createdAt,
            status: booking.bookingStatus || 'CONFIRMED',
            emiSchedule: [],
            documents: [],
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        };

        res.json(formattedBooking);
    } catch (error) {
        console.error('Get Booking By ID Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getEMISchedule = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        // Check if booking belongs to user
        const booking = await Investment.findOne({ where: { id: bookingId, userId: req.user.id } });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Mock EMI Schedule if Installment model is empty or not populated
        // Check if Installment model exists and has data
        let schedules = [];
        if (Installment) {
            schedules = await Installment.findAll({ where: { investmentId: bookingId } });
        }

        if (!schedules || schedules.length === 0) {
            // Return mock schedule based on booking details
            const totalInstallments = booking.totalInstallments || 12;
            const amount = booking.installmentAmount || 1000;
            const startDate = new Date(booking.createdAt);

            for (let i = 0; i < totalInstallments; i++) {
                const dueDate = new Date(startDate);
                dueDate.setMonth(dueDate.getMonth() + i);
                schedules.push({
                    id: i + 1,
                    dueDate: dueDate.toISOString().split('T')[0],
                    amount: amount,
                    status: i < (booking.installmentsPaid || 0) ? 'PAID' : 'PENDING',
                    paymentDate: i < (booking.installmentsPaid || 0) ? dueDate.toISOString().split('T')[0] : null
                });
            }
        }

        res.json(schedules);
    } catch (error) {
        console.error('Get EMI Schedule Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
