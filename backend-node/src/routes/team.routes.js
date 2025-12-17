const express = require('express');
const {
    getDirectReferrals,
    getTeamMembers,
    getTeamStats,
    getTeamReport,
    getUnilevelTree,
    getLevelBreakdown,
    getTeamMemberDetails,
    getDirectReferralsStats,
    getDirectReferralPerformance,
    getTeamBV
} = require('../controllers/team.controller');
const {
    getTreeView,
    getLevelTreeView,
    expandTreeNode,
    searchTreeMembers,
    getDirectReferrals: adminGetDirectReferrals,
    getTotalDownline,
    getTeamLevelDownline,
    getDownlineBusiness,
    getTeamStats: adminGetTeamStats,
    exportTeam
} = require('../controllers/admin/team.admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// User routes
router.get('/business-volume', protect, getTeamBV);
router.get('/direct-referrals/performance', protect, getDirectReferralPerformance);
router.get('/direct-referrals/stats', protect, getDirectReferralsStats);
router.get('/direct-referrals', protect, getDirectReferrals);
router.get('/members', protect, getTeamMembers);
router.get('/stats', protect, getTeamStats);
router.get('/report', protect, getTeamReport);
router.get('/unilevel-tree', protect, getUnilevelTree);
router.get('/levels', protect, getLevelBreakdown);
router.get('/level-breakdown', protect, getLevelBreakdown); // Alias for /levels
router.get('/growth', protect, getTeamStats); // Use team stats for growth data
router.get('/member/:memberId', protect, getTeamMemberDetails);

// Admin routes
router.get('/admin/tree-view', protect, authorize('ADMIN'), getTreeView);
// router.get('/admin/tree-view', getTreeView);
router.get('/admin/level-tree-view', protect, authorize('ADMIN'), getLevelTreeView);
router.get('/admin/level-tree-view/expand/:nodeId', protect, authorize('ADMIN'), expandTreeNode);
router.get('/admin/level-tree-view/search', protect, authorize('ADMIN'), searchTreeMembers);
router.get('/admin/direct-referral', protect, authorize('ADMIN'), adminGetDirectReferrals);
router.get('/admin/total-downline', protect, authorize('ADMIN'), getTotalDownline);
router.get('/admin/level-downline', protect, authorize('ADMIN'), getTeamLevelDownline);
router.get('/admin/downline-business', protect, authorize('ADMIN'), getDownlineBusiness);
router.get('/admin/stats', protect, authorize('ADMIN'), adminGetTeamStats);
router.get('/admin/export', protect, authorize('ADMIN'), exportTeam);

// User-facing Level Tree View (shows only their own downline)
router.get('/level-tree-view', protect, getLevelTreeView);
router.get('/level-tree-view/expand/:nodeId', protect, expandTreeNode);
router.get('/level-tree-view/search', protect, searchTreeMembers);

module.exports = router;
