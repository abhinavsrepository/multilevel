const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import logger and middleware
const logger = require('./config/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger, performanceLogger } = require('./middleware/requestLogger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const propertyRoutes = require('./routes/property.routes');
const investmentRoutes = require('./routes/investment.routes');
const walletRoutes = require('./routes/wallet.routes');
const commissionRoutes = require('./routes/commission.routes');
const payoutRoutes = require('./routes/payout.routes');
const treeRoutes = require('./routes/tree.routes');
const kycRoutes = require('./routes/kyc.routes');
const adminRoutes = require('./routes/admin.routes');
const supportTicketRoutes = require('./routes/support-ticket.routes');
const bankAccountRoutes = require('./routes/bank-account.routes');
const notificationRoutes = require('./routes/notification.routes');
const installmentRoutes = require('./routes/installment.routes');
const rankRoutes = require('./routes/rank.routes');
const rankRewardRoutes = require('./routes/rank-reward.routes');
const rankAchievementRoutes = require('./routes/rank-achievement.routes');
const auditRoutes = require('./routes/audit.routes');
const teamRoutes = require('./routes/team.routes');
const uploadRoutes = require('./routes/upload.routes');
const epinRoutes = require('./routes/epin.routes');
const depositRoutes = require('./routes/deposit.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const incomeRoutes = require('./routes/income.routes');
const settingsRoutes = require('./routes/settings.routes');
const registrationRoutes = require('./routes/registration.routes');
const directBonusRoutes = require('./routes/direct-bonus.routes');
const levelBonusRoutes = require('./routes/level-bonus.routes');
const matchingBonusRoutes = require('./routes/matching-bonus.routes');
const bonanzaEnhancedRoutes = require('./routes/bonanza-enhanced.routes');
const topupRoutes = require('./routes/topup.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const bookingRoutes = require('./routes/booking.routes');
const documentRoutes = require('./routes/document.routes');
const siteVisitRoutes = require('./routes/site-visit.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow all origins in development
        return callback(null, true);
    },
    credentials: true
}));

// Body parsing middleware with error handling
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            logger.error('Invalid JSON in request body', {
                error: e.message,
                url: req.originalUrl
            });
            throw new Error('Invalid JSON');
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));
app.use(requestLogger);
app.use(performanceLogger);

// Health check routes (before other routes)
app.use('/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/commissions', commissionRoutes);
app.use('/api/v1/payouts', payoutRoutes);
app.use('/api/v1/tree', treeRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/support', supportTicketRoutes);
app.use('/api/v1/bank-accounts', bankAccountRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/installments', installmentRoutes);
app.use('/api/v1/ranks', rankRoutes);
app.use('/api/v1/rank-rewards', rankRewardRoutes);
app.use('/api/v1/rank-achievements', rankAchievementRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/epins', epinRoutes);
app.use('/api/v1/deposits', depositRoutes);
app.use('/api/v1/withdrawals', withdrawalRoutes);

app.use('/api/v1/incomes', incomeRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1/direct-bonus', directBonusRoutes);
app.use('/api/v1/level-bonus', levelBonusRoutes);
app.use('/api/v1/matching-bonus', matchingBonusRoutes);
app.use('/api/v1/bonanza', bonanzaEnhancedRoutes);
app.use('/api/v1/topup', topupRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/site-visits', siteVisitRoutes);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve admin panel static files
const adminPanelPath = path.join(__dirname, '../../react-admin-panel/dist');
app.use(express.static(adminPanelPath));

// SPA fallback - serve index.html for all non-API routes
// This ensures React Router can handle routing on refresh
// Express 5 requires explicit parameter names, so we use :path*
app.use((req, res, next) => {
    // Skip API routes and uploads
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health')) {
        return next();
    }

    // Serve index.html for all other routes
    res.sendFile(path.join(adminPanelPath, 'index.html'), (err) => {
        if (err) {
            logger.error('Error serving admin panel index.html', {
                error: err.message,
                path: req.path
            });
            next(err);
        }
    });
});

// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Log that app is configured
logger.info('Express app configured with all routes and middleware');

module.exports = app;
