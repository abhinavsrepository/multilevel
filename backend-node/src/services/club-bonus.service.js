const { User, ClubTier, ClubQualification, Income, Wallet, Investment, Installment } = require('../models');
const { Op, Sequelize } = require('sequelize');
const db = require('../models');

/**
 * Get team business volume for a user (includes Primary Bookings + Repayments)
 * @param {number} userId - User ID
 * @param {Date} startDate - Start date for calculation
 * @param {Date} endDate - End date for calculation
 * @returns {Promise<number>} Total team business volume
 */
exports.getTeamBusinessVolume = async (userId, startDate = null, endDate = null) => {
    try {
        // Get all team members (downline in sponsor tree)
        const teamMembers = await getTeamMemberIds(userId);
        teamMembers.push(userId); // Include user's own business

        const whereClause = {
            userId: {
                [Op.in]: teamMembers
            },
            investmentStatus: {
                [Op.in]: ['ACTIVE', 'COMPLETED', 'MATURED']
            }
        };

        // Add date filters if provided
        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        }

        // Calculate primary bookings (initial investment amounts)
        const primaryBookings = await Investment.sum('investmentAmount', {
            where: whereClause
        }) || 0;

        // Calculate repayments (installments paid)
        const repayments = await db.sequelize.query(`
            SELECT COALESCE(SUM(i.paid_amount), 0) as total_repayments
            FROM installments i
            INNER JOIN investments inv ON i.investment_id = inv.id
            WHERE inv.user_id IN (:teamMembers)
            AND i.status = 'PAID'
            ${startDate && endDate ? `AND i.paid_date BETWEEN :startDate AND :endDate` : ''}
        `, {
            replacements: {
                teamMembers,
                startDate: startDate || null,
                endDate: endDate || null
            },
            type: Sequelize.QueryTypes.SELECT
        });

        const totalRepayments = parseFloat(repayments[0]?.total_repayments || 0);

        return parseFloat(primaryBookings) + totalRepayments;
    } catch (error) {
        console.error('Error calculating team business volume:', error);
        throw error;
    }
};

/**
 * Get all team member IDs recursively (sponsor tree)
 * @param {number} userId - User ID
 * @returns {Promise<Array<number>>} Array of team member IDs
 */
async function getTeamMemberIds(userId) {
    const teamIds = [];
    const queue = [userId];

    while (queue.length > 0) {
        const currentId = queue.shift();

        // Get direct referrals
        const directs = await User.findAll({
            where: { sponsorUserId: currentId },
            attributes: ['id'],
            raw: true
        });

        for (const direct of directs) {
            if (!teamIds.includes(direct.id)) {
                teamIds.push(direct.id);
                queue.push(direct.id);
            }
        }
    }

    return teamIds;
}

/**
 * Get business volume for each direct leg (40:60 balancing rule)
 * @param {number} userId - User ID
 * @param {Date} startDate - Start date for calculation
 * @param {Date} endDate - End date for calculation
 * @returns {Promise<Array<Object>>} Array of leg volumes
 */
exports.getDirectLegVolumes = async (userId, startDate = null, endDate = null) => {
    try {
        // Get direct referrals
        const directReferrals = await User.findAll({
            where: { sponsorUserId: userId },
            attributes: ['id', 'username', 'fullName'],
            raw: true
        });

        const legVolumes = [];

        for (const direct of directReferrals) {
            const volume = await this.getTeamBusinessVolume(direct.id, startDate, endDate);
            legVolumes.push({
                userId: direct.id,
                username: direct.username,
                fullName: direct.fullName,
                volume: parseFloat(volume)
            });
        }

        // Sort by volume descending
        legVolumes.sort((a, b) => b.volume - a.volume);

        return legVolumes;
    } catch (error) {
        console.error('Error calculating direct leg volumes:', error);
        throw error;
    }
};

/**
 * Check if user passes 40:60 balancing rule
 * @param {number} userId - User ID
 * @param {number} requiredVolume - Required team business volume
 * @param {Date} startDate - Start date for calculation
 * @param {Date} endDate - End date for calculation
 * @param {number} strongPercentage - Maximum percentage from strongest leg (default 60)
 * @param {number} weakPercentage - Minimum percentage from other legs (default 40)
 * @returns {Promise<Object>} Balancing check result
 */
exports.checkBalancingRule = async (userId, requiredVolume, startDate = null, endDate = null, strongPercentage = 60, weakPercentage = 40) => {
    try {
        const legVolumes = await this.getDirectLegVolumes(userId, startDate, endDate);

        if (legVolumes.length === 0) {
            return {
                passed: false,
                reason: 'No direct referrals found',
                strongestLeg: null,
                strongestLegVolume: 0,
                otherLegsVolume: 0,
                strongLegPercentage: 0,
                weakLegsPercentage: 0,
                totalVolume: 0
            };
        }

        // Strongest leg is first (sorted descending)
        const strongestLeg = legVolumes[0];
        const strongestLegVolume = strongestLeg.volume;

        // Calculate other legs volume
        const otherLegsVolume = legVolumes.slice(1).reduce((sum, leg) => sum + leg.volume, 0);

        const totalVolume = strongestLegVolume + otherLegsVolume;

        // Calculate percentages
        const strongLegPerc = totalVolume > 0 ? (strongestLegVolume / totalVolume) * 100 : 0;
        const weakLegsPerc = totalVolume > 0 ? (otherLegsVolume / totalVolume) * 100 : 0;

        // Check if balancing rule is satisfied
        const maxStrongAllowed = (requiredVolume * strongPercentage) / 100;
        const minWeakRequired = (requiredVolume * weakPercentage) / 100;

        const passed = strongestLegVolume <= maxStrongAllowed && otherLegsVolume >= minWeakRequired;

        return {
            passed,
            reason: passed ? 'Balancing rule satisfied' :
                `Strongest leg: ${strongLegPerc.toFixed(2)}% (max ${strongPercentage}%), Other legs: ${weakLegsPerc.toFixed(2)}% (min ${weakPercentage}%)`,
            strongestLeg,
            strongestLegVolume,
            otherLegsVolume,
            strongLegPercentage: strongLegPerc,
            weakLegsPercentage: weakLegsPerc,
            totalVolume,
            legVolumes
        };
    } catch (error) {
        console.error('Error checking balancing rule:', error);
        throw error;
    }
};

/**
 * Calculate TDS deduction
 * @param {number} amount - Gross amount
 * @param {number} tdsPercentage - TDS percentage (default 5%)
 * @returns {Object} TDS calculation result
 */
exports.calculateTDS = (amount, tdsPercentage = 5) => {
    const tdsAmount = (amount * tdsPercentage) / 100;
    const netAmount = amount - tdsAmount;

    return {
        grossAmount: parseFloat(amount),
        tdsPercentage: parseFloat(tdsPercentage),
        tdsAmount: parseFloat(tdsAmount.toFixed(2)),
        netAmount: parseFloat(netAmount.toFixed(2))
    };
};

/**
 * Check if user qualifies for a specific club tier
 * @param {number} userId - User ID
 * @param {number} clubTierId - Club Tier ID
 * @param {Date} qualificationMonth - Month for which qualification is checked
 * @returns {Promise<Object>} Qualification check result
 */
exports.checkUserQualification = async (userId, clubTierId, qualificationMonth) => {
    try {
        // Get user details
        const user = await User.findByPk(userId);
        if (!user) {
            return {
                qualified: false,
                reason: 'User not found',
                status: 'DISQUALIFIED_ACTIVATION'
            };
        }

        // Check activation status
        if (user.status !== 'ACTIVE') {
            return {
                qualified: false,
                reason: 'User is not active',
                status: 'DISQUALIFIED_ACTIVATION',
                user
            };
        }

        // Check KYC status
        if (user.kycStatus !== 'APPROVED' && user.kycStatus !== 'VERIFIED') {
            return {
                qualified: false,
                reason: 'KYC not approved',
                status: 'DISQUALIFIED_KYC',
                user
            };
        }

        // Get club tier details
        const clubTier = await ClubTier.findByPk(clubTierId);
        if (!clubTier || !clubTier.isActive) {
            return {
                qualified: false,
                reason: 'Club tier not found or inactive',
                status: 'DISQUALIFIED_ACTIVATION',
                user
            };
        }

        // Calculate date ranges
        const monthStart = new Date(qualificationMonth);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        // Calculate previous month for new sales check
        const prevMonthStart = new Date(monthStart);
        prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

        const prevMonthEnd = new Date(monthStart);
        prevMonthEnd.setDate(0);
        prevMonthEnd.setHours(23, 59, 59, 999);

        // Get total team business (all time up to current month end)
        const totalTeamBusiness = await this.getTeamBusinessVolume(userId, null, monthEnd);

        // Get previous month's team business for new sales calculation
        const previousTeamBusiness = await this.getTeamBusinessVolume(userId, null, prevMonthEnd);

        // Get current month new sales
        const currentMonthSales = await this.getTeamBusinessVolume(userId, monthStart, monthEnd);

        // Check if total team business meets requirement
        if (totalTeamBusiness < parseFloat(clubTier.requiredTeamBusiness)) {
            return {
                qualified: false,
                reason: `Total team business ${totalTeamBusiness} is less than required ${clubTier.requiredTeamBusiness}`,
                status: 'DISQUALIFIED_ACTIVATION',
                user,
                clubTier,
                totalTeamBusiness,
                currentMonthSales
            };
        }

        // Check new sales requirement (10% of previous eligibility)
        const requiredNewSales = (parseFloat(clubTier.requiredTeamBusiness) * parseFloat(clubTier.newSalesRequirement)) / 100;
        if (currentMonthSales < requiredNewSales) {
            return {
                qualified: false,
                reason: `New sales ${currentMonthSales} is less than required ${requiredNewSales} (${clubTier.newSalesRequirement}% of ${clubTier.requiredTeamBusiness})`,
                status: 'DISQUALIFIED_NEW_SALES',
                user,
                clubTier,
                totalTeamBusiness,
                currentMonthSales,
                requiredNewSales
            };
        }

        // Check 40:60 balancing rule (using all-time data up to current month)
        const balancingCheck = await this.checkBalancingRule(
            userId,
            parseFloat(clubTier.requiredTeamBusiness),
            null,
            monthEnd,
            parseFloat(clubTier.balancingRuleStrong),
            parseFloat(clubTier.balancingRuleWeak)
        );

        if (!balancingCheck.passed) {
            return {
                qualified: false,
                reason: balancingCheck.reason,
                status: 'DISQUALIFIED_BALANCING',
                user,
                clubTier,
                totalTeamBusiness,
                currentMonthSales,
                balancingCheck
            };
        }

        // User is qualified!
        // Calculate bonus
        const bonusAmount = (totalTeamBusiness * parseFloat(clubTier.bonusPercentage)) / 100;
        const tdsCalculation = this.calculateTDS(bonusAmount, 5); // 5% TDS

        return {
            qualified: true,
            reason: 'All qualification criteria met',
            status: 'QUALIFIED',
            user,
            clubTier,
            totalTeamBusiness,
            currentMonthSales,
            requiredNewSales,
            newSalesPercentage: (currentMonthSales / requiredNewSales) * 100,
            balancingCheck,
            bonusAmount,
            tdsCalculation
        };

    } catch (error) {
        console.error('Error checking user qualification:', error);
        throw error;
    }
};

/**
 * Process club bonus for a single user
 * @param {number} userId - User ID
 * @param {number} clubTierId - Club Tier ID
 * @param {Date} qualificationMonth - Month for qualification
 * @returns {Promise<Object>} Processing result
 */
exports.processUserClubBonus = async (userId, clubTierId, qualificationMonth) => {
    const transaction = await db.sequelize.transaction();

    try {
        // Check qualification
        const qualificationResult = await this.checkUserQualification(userId, clubTierId, qualificationMonth);

        // Create qualification record
        const qualificationData = {
            userId: userId,
            clubTierId: clubTierId,
            qualificationMonth: qualificationMonth,
            totalTeamBusiness: qualificationResult.totalTeamBusiness || 0,
            strongestLegVolume: qualificationResult.balancingCheck?.strongestLegVolume || 0,
            strongestLegUserId: qualificationResult.balancingCheck?.strongestLeg?.userId || null,
            otherLegsVolume: qualificationResult.balancingCheck?.otherLegsVolume || 0,
            strongLegPercentage: qualificationResult.balancingCheck?.strongLegPercentage || 0,
            weakLegsPercentage: qualificationResult.balancingCheck?.weakLegsPercentage || 0,
            newSalesVolume: qualificationResult.currentMonthSales || 0,
            newSalesPercentage: qualificationResult.newSalesPercentage || 0,
            bonusAmount: qualificationResult.bonusAmount || 0,
            tdsAmount: qualificationResult.tdsCalculation?.tdsAmount || 0,
            netAmount: qualificationResult.tdsCalculation?.netAmount || 0,
            qualificationStatus: qualificationResult.status,
            disqualificationReason: qualificationResult.qualified ? null : qualificationResult.reason,
            calculationDetails: {
                balancingCheck: qualificationResult.balancingCheck,
                tdsCalculation: qualificationResult.tdsCalculation,
                requiredNewSales: qualificationResult.requiredNewSales
            },
            processedAt: new Date()
        };

        const qualification = await ClubQualification.create(qualificationData, { transaction });

        // If qualified, create income entry and update wallet
        if (qualificationResult.qualified) {
            const income = await Income.create({
                userId: userId,
                incomeType: 'CLUB_INCOME',
                amount: qualificationResult.tdsCalculation.netAmount,
                baseAmount: qualificationResult.totalTeamBusiness,
                percentage: parseFloat(qualificationResult.clubTier.bonusPercentage),
                status: 'APPROVED',
                remarks: `${qualificationResult.clubTier.name} - Monthly Club Incentive for ${new Date(qualificationMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}. TDS ${qualificationResult.tdsCalculation.tdsPercentage}% deducted.`,
                processedAt: new Date()
            }, { transaction });

            // Update qualification with income ID
            await qualification.update({ incomeId: income.id }, { transaction });

            // Update wallet
            const wallet = await Wallet.findOne({ where: { userId: userId } });
            if (wallet) {
                await wallet.increment('commissionBalance', {
                    by: qualificationResult.tdsCalculation.netAmount,
                    transaction
                });
                await wallet.increment('totalEarned', {
                    by: qualificationResult.tdsCalculation.netAmount,
                    transaction
                });
            }

            console.log(`✓ Club bonus of ₹${qualificationResult.tdsCalculation.netAmount} credited to user ${userId} for ${qualificationResult.clubTier.name}`);
        } else {
            console.log(`✗ User ${userId} disqualified: ${qualificationResult.reason}`);
        }

        await transaction.commit();

        return {
            success: true,
            qualified: qualificationResult.qualified,
            qualification,
            income: qualificationResult.qualified ? qualification.incomeId : null
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error processing user club bonus:', error);
        throw error;
    }
};

/**
 * Distribute club bonuses for all qualified users (Monthly Trigger)
 * @param {Date} qualificationMonth - Month for which to distribute bonuses (defaults to previous month)
 * @returns {Promise<Object>} Distribution result
 */
exports.distributeClubBonuses = async (qualificationMonth = null) => {
    try {
        // Default to previous month if not specified
        if (!qualificationMonth) {
            const now = new Date();
            qualificationMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        }

        console.log(`\n========================================`);
        console.log(`Starting Club Bonus Distribution`);
        console.log(`Month: ${new Date(qualificationMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}`);
        console.log(`========================================\n`);

        // Get all active club tiers
        const clubTiers = await ClubTier.findAll({
            where: { isActive: true },
            order: [['displayOrder', 'ASC']]
        });

        if (clubTiers.length === 0) {
            console.log('No active club tiers found.');
            return {
                success: true,
                message: 'No active club tiers',
                results: []
            };
        }

        // Get all active users with approved KYC
        const eligibleUsers = await User.findAll({
            where: {
                status: 'ACTIVE',
                kycStatus: {
                    [Op.in]: ['APPROVED', 'VERIFIED']
                }
            },
            attributes: ['id', 'username', 'fullName']
        });

        console.log(`Found ${eligibleUsers.length} eligible users (Active + KYC Approved)`);
        console.log(`Found ${clubTiers.length} active club tiers\n`);

        const results = [];

        // Process each tier
        for (const tier of clubTiers) {
            console.log(`\n--- Processing ${tier.name} (Required: ₹${tier.requiredTeamBusiness}) ---\n`);

            let qualified = 0;
            let disqualified = 0;
            let totalPaid = 0;

            for (const user of eligibleUsers) {
                try {
                    const result = await this.processUserClubBonus(user.id, tier.id, qualificationMonth);

                    if (result.qualified) {
                        qualified++;
                        totalPaid += parseFloat(result.qualification.netAmount);
                    } else {
                        disqualified++;
                    }

                    results.push({
                        userId: user.id,
                        username: user.username,
                        tierName: tier.name,
                        qualified: result.qualified,
                        status: result.qualification.qualificationStatus,
                        amount: result.qualification.netAmount
                    });

                } catch (error) {
                    console.error(`Error processing user ${user.id} for tier ${tier.id}:`, error.message);
                    results.push({
                        userId: user.id,
                        username: user.username,
                        tierName: tier.name,
                        qualified: false,
                        status: 'ERROR',
                        error: error.message
                    });
                }
            }

            console.log(`\n${tier.name} Summary:`);
            console.log(`  Qualified: ${qualified}`);
            console.log(`  Disqualified: ${disqualified}`);
            console.log(`  Total Paid: ₹${totalPaid.toFixed(2)}`);
        }

        console.log(`\n========================================`);
        console.log(`Club Bonus Distribution Completed`);
        console.log(`========================================\n`);

        return {
            success: true,
            message: 'Club bonus distribution completed',
            month: qualificationMonth,
            results
        };

    } catch (error) {
        console.error('Error distributing club bonuses:', error);
        throw error;
    }
};

module.exports = exports;
