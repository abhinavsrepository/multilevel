const { User, Property, Investment, Commission, Task, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let stats = {
            totalClients: 0,
            activeClients: 0,
            followUpsToday: 0,
            commissionEarned: 0,
            commissionPending: 0,
            activeBookings: 0,
            totalRevenue: 0,
            pendingEMIs: 0,
            nextSiteVisit: null
        };

        if (role === 'ASSOCIATE') {
            // Associate Stats
            stats.totalClients = await User.count({ where: { referralCode: req.user.code || 'REF123' } }); // Mock logic for referral
            stats.activeClients = Math.floor(stats.totalClients * 0.8); // Mock
            stats.commissionEarned = 15000; // Mock
            stats.commissionPending = 5000; // Mock

            // Real query for tasks if model exists, else mock
            // const todayStart = new Date(); todayStart.setHours(0,0,0,0);
            // const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
            // stats.followUpsToday = await Task.count({ 
            //    where: { 
            //        assignedTo: userId, 
            //        dueDate: { [Op.between]: [todayStart, todayEnd] } 
            //    } 
            // });
            stats.followUpsToday = 5;
            // Customer Stats
            try {
                if (Investment) {
                    stats.activeBookings = await Investment.count({ where: { userId, status: 'ACTIVE' } });
                    stats.totalRevenue = await Investment.sum('amount', { where: { userId, status: 'ACTIVE' } }) || 0;
                } else {
                    stats.activeBookings = 0;
                    stats.totalRevenue = 0;
                }
            } catch (err) {
                console.warn('Investment model not accessible:', err);
                stats.activeBookings = 0;
                stats.totalRevenue = 0;
            }
            stats.pendingEMIs = 2; // Mock
            stats.nextSiteVisit = '2024-12-25'; // Mock
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getRevenueChart = async (req, res) => {
    try {
        // Mock data for last 30 days
        const data = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                value: Math.floor(Math.random() * 10000) + 5000
            });
        }
        res.json({ success: true, data });
    } catch (error) {
        console.error('Revenue Chart Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getLeadPipeline = async (req, res) => {
    try {
        // Mock Pipeline Data
        const data = [
            { status: 'New', count: 12 },
            { status: 'Contacted', count: 8 },
            { status: 'Qualified', count: 5 },
            { status: 'Proposal', count: 3 },
            { status: 'Negotiation', count: 2 }
        ];
        res.json({ success: true, data });
    } catch (error) {
        console.error('Lead Pipeline Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getTodayFollowUps = async (req, res) => {
    try {
        // Mock Follow-ups
        const data = [
            { clientId: 1, clientName: 'John Doe', type: 'Call', scheduledTime: '10:00 AM', status: 'PENDING' },
            { clientId: 2, clientName: 'Alice Smith', type: 'Site Visit', scheduledTime: '02:00 PM', status: 'CONFIRMED' },
            { clientId: 3, clientName: 'Bob Johnson', type: 'Meeting', scheduledTime: '04:30 PM', status: 'PENDING' }
        ];
        res.json({ success: true, data });
    } catch (error) {
        console.error('Follow-ups Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
