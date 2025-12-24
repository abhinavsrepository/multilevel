const { Commission, User, Wallet, Income, SystemSettings } = require('../models');
const { Op } = require('sequelize');

exports.calculateLevelCommission = async (investment) => {
    try {
        console.log(`Calculating Ecogram commissions for investment: ${investment.id}`);

        const amount = parseFloat(investment.investmentAmount || investment.totalPaid || 0);
        if (amount <= 0) return;

        // 1. Fetch Investor and Sponsor
        const investor = await User.findByPk(investment.userId);
        if (!investor) return;

        if (!investor.sponsorUserId) {
            console.log(`No sponsor for user ${investor.username}, skipping commissions.`);
            return;
        }

        const directSponsor = await User.findByPk(investor.sponsorUserId);
        if (!directSponsor) return;

        const TDS_RATE = 5; // 5% Standard TDS

        // =================================================================
        // 1. DIRECT INCENTIVE (5%)
        // =================================================================

        const DIRECT_INCENTIVE_PERCENT = 5;
        const directGrossAmount = (amount * DIRECT_INCENTIVE_PERCENT) / 100;

        if (directSponsor.status === 'ACTIVE') {

            // Calculate Deductions
            const tdsAmount = (directGrossAmount * TDS_RATE) / 100;
            const netAmount = directGrossAmount - tdsAmount;

            await Income.create({
                userId: directSponsor.id,
                amount: directGrossAmount, // Store Gross
                tdsAmount: tdsAmount,
                netAmount: netAmount,
                incomeType: 'DIRECT_BONUS',
                status: 'APPROVED',
                fromUserId: investor.id,
                referenceType: 'INVESTMENT',
                referenceId: investment.id,
                percentage: DIRECT_INCENTIVE_PERCENT,
                baseAmount: amount,
                remarks: `Direct Incentive from ${investor.username} (Net: ${netAmount})`,
                processedAt: new Date()
            });

            // Update Wallet with NET AMOUNT
            const wallet = await Wallet.findOne({ where: { userId: directSponsor.id } });
            if (wallet) {
                await wallet.increment('commissionBalance', { by: netAmount });
                await wallet.increment('totalEarned', { by: netAmount }); // Should totalEarned be Gross or Net? Usually Gross in Reports, Net in Wallet. 
                // However, incrementing totalEarned by Net ensures balance consistency if totalEarned tracks strictly "money user got". 
                // Let's stick to incrementing by netAmount to be safe, or we track gross separately.
                // Standard: Wallet Balance += Net. Total Income Report might sum Gross from Income Table.
            }
            console.log(`Direct Incentive of ${netAmount} (Net) credited to ${directSponsor.username}`);
        } else {
            console.log(`Direct Incentive skipped for ${directSponsor.username} (Not Active)`);
        }

        // =================================================================
        // 2. TEAM SALES BONUS (TSB) - Level Wise
        // =================================================================

        const TSB_POOL_PERCENT = 15;
        const tsbPoolAmount = (amount * TSB_POOL_PERCENT) / 100;

        const tsbDistribution = {
            1: { percent: 30, requiredDirects: 1 },
            2: { percent: 20, requiredDirects: 1 },
            3: { percent: 15, requiredDirects: 2 },
            // 4-10 handled in loop
        };

        let currentUpline = directSponsor;
        let currentLevel = 1;
        const MAX_LEVEL = 10;

        while (currentUpline && currentLevel <= MAX_LEVEL) {

            let levelConfig = tsbDistribution[currentLevel];
            if (!levelConfig && currentLevel >= 4 && currentLevel <= 10) {
                levelConfig = { percent: 5, requiredDirects: 3 };
            }

            if (levelConfig) {
                if (currentUpline.status === 'ACTIVE') {
                    const directCount = await User.count({
                        where: {
                            sponsorUserId: currentUpline.id,
                            status: 'ACTIVE'
                        }
                    });

                    if (directCount >= levelConfig.requiredDirects) {
                        const shareGrossAmount = (tsbPoolAmount * levelConfig.percent) / 100;

                        // Calculate Deductions
                        const tdsAmount = (shareGrossAmount * TDS_RATE) / 100;
                        const netAmount = shareGrossAmount - tdsAmount;

                        await Income.create({
                            userId: currentUpline.id,
                            amount: shareGrossAmount, // Gross
                            tdsAmount: tdsAmount,
                            netAmount: netAmount,
                            incomeType: 'TSB_BONUS',
                            status: 'APPROVED',
                            fromUserId: investor.id,
                            level: currentLevel,
                            referenceType: 'INVESTMENT',
                            referenceId: investment.id,
                            percentage: (TSB_POOL_PERCENT * levelConfig.percent) / 100,
                            baseAmount: amount,
                            remarks: `TSB Level ${currentLevel} from ${investor.username} (Net: ${netAmount})`,
                            processedAt: new Date()
                        });

                        // Update Wallet with NET AMOUNT
                        const wallet = await Wallet.findOne({ where: { userId: currentUpline.id } });
                        if (wallet) {
                            await wallet.increment('commissionBalance', { by: netAmount });
                            await wallet.increment('totalEarned', { by: netAmount });
                        }

                        console.log(`TSB Level ${currentLevel} (${netAmount} Net) credited to ${currentUpline.username}`);
                    } else {
                        console.log(`TSB Level ${currentLevel} skipped for ${currentUpline.username}. Required Directs: ${levelConfig.requiredDirects}, Has: ${directCount}`);
                    }
                }
            }

            if (currentUpline.sponsorUserId) {
                currentUpline = await User.findByPk(currentUpline.sponsorUserId);
            } else {
                currentUpline = null;
            }
            currentLevel++;
        }

    } catch (error) {
        console.error('Error calculating Ecogram commissions:', error);
    }
};
