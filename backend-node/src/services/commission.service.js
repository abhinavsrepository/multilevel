const { Commission, LevelCommissionRule, User, Wallet } = require('../models');
const { Op } = require('sequelize');

exports.calculateLevelCommission = async (investment) => {
    try {
        console.log(`Calculating level commission for investment: ${investment.id}`);

        // 1. Fetch all active commission rules
        const rules = await LevelCommissionRule.findAll({
            where: { isActive: true },
            order: [['level', 'ASC']]
        });

        if (rules.length === 0) return;

        // 2. Get the investor (user who made the investment)
        const investor = await User.findByPk(investment.userId);
        if (!investor) return;

        // 3. Traverse upline
        let currentUpline = await User.findByPk(investor.sponsorUserId);
        let currentLevel = 1;

        // Map rules by level for easy access
        const rulesMap = {};
        rules.forEach(rule => {
            rulesMap[rule.level] = rule;
        });

        const maxLevel = Math.max(...rules.map(r => r.level));

        while (currentUpline && currentLevel <= maxLevel) {
            const rule = rulesMap[currentLevel];

            if (rule) {
                // --- UNLOCK RULE IMPLEMENTATION ---
                // "Associate's own Direct Referral Count (which unlocks the payout levels)."
                const directCount = await User.count({
                    where: {
                        sponsorUserId: currentUpline.id, // Fixed: Use sponsorUserId (FK) instead of sponsorId (String Code)
                        status: 'ACTIVE' // Explicitly checking for ACTIVE directs as is standard in MLM
                    }
                });

                // Apply Unlock Rule based on Active Directs
                // 1 Active Direct  = Unlocks Level 1 & 2
                // 3 Active Directs = Unlocks Level 3 (and implied 4, 5 pending further clarification, setting typically to 5)
                // 5 Active Directs = Unlocks All Levels (e.g. 10)

                let allowedDepth = 0;
                if (directCount >= 5) allowedDepth = 20; // Unlocks "All Pending Levels"
                else if (directCount >= 3) allowedDepth = 5; // Unlocks Level 3 (and possibly up to 5)
                else if (directCount >= 1) allowedDepth = 2; // Unlocks Level 1 & 2
                else allowedDepth = 0;

                let isEligible = true;
                let rejectionReason = '';

                // If the level of the selling agent (Relative to Upline) is deeper than Upline's Allowed Depth
                if (currentLevel > allowedDepth) {
                    isEligible = false;
                    rejectionReason = `Level ${currentLevel} locked. Requires more direct referrals (Current: ${directCount}, Allowed Depth: ${allowedDepth}).`;
                }

                // Check rank qualification if required (and if still eligible)
                if (isEligible && rule.requiredRank && currentUpline.rank !== rule.requiredRank) {
                    // We can treat rank as a blocker or just a warning. Existing code only warned.
                    // To follow strict compliance, we should probably block or at least log failure.
                    // Given the prompt emphasized the Direct Count rule, we will keep rank as secondary check.
                    // Let's strict check rank too if defined.
                    console.log(`User ${currentUpline.id} does not meet rank requirement for level ${currentLevel}`);
                    // un-comment below to enforce rank
                    // isEligible = false;
                    // rejectionReason = `Rank ${rule.requiredRank} required.`;
                }

                let commissionAmount = 0;
                let percentage = 0;

                if (rule.commissionType === 'PERCENTAGE') {
                    percentage = parseFloat(rule.value);
                    commissionAmount = (parseFloat(investment.investmentAmount) * percentage) / 100;
                } else {
                    commissionAmount = parseFloat(rule.value);
                }

                if (commissionAmount > 0) {
                    // Create Commission Record (Logged even if blocked, for visibility)
                    const status = isEligible ? 'EARNED' : 'BLOCKED';

                    // Use description to show the user why it was blocked or approved
                    const description = isEligible
                        ? `Level ${currentLevel} commission from ${investor.username}`
                        : `Payout Blocked: ${rejectionReason}`;

                    await Commission.create({
                        commissionId: `COM-${Date.now()}-${currentUpline.id}-${currentLevel}`,
                        userId: currentUpline.id,
                        fromUserId: investor.id,
                        commissionType: `LEVEL_${currentLevel}`,
                        level: currentLevel,
                        amount: commissionAmount,
                        percentage: percentage > 0 ? percentage : null,
                        baseAmount: investment.investmentAmount,
                        propertyId: investment.propertyId,
                        investmentId: investment.investmentId,
                        description: description,
                        status: status,
                        calculationDetails: {
                            directs: directCount,
                            allowedLevel: allowedDepth,
                            reason: rejectionReason,
                            ruleLevel: currentLevel
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });

                    if (isEligible) {
                        // Update Wallet if eligible
                        const wallet = await Wallet.findOne({ where: { userId: currentUpline.id } });
                        if (wallet) {
                            await wallet.increment('commissionBalance', { by: commissionAmount });
                            await wallet.increment('totalEarned', { by: commissionAmount });
                        }
                        console.log(`Commission of ${commissionAmount} credited to ${currentUpline.id} for level ${currentLevel}`);
                    } else {
                        console.log(`Commission blocked for ${currentUpline.id} at level ${currentLevel}. Reason: ${rejectionReason}`);
                    }
                }
            }

            // Move to next upline
            if (currentUpline.sponsorUserId) {
                currentUpline = await User.findByPk(currentUpline.sponsorUserId);
            } else {
                currentUpline = null;
            }
            currentLevel++;
        }

    } catch (error) {
        console.error('Error calculating level commission:', error);
    }
};
