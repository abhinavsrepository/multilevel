const { User, Income, Wallet, SystemSettings } = require('../models');
const { Op } = require('sequelize');
const businessService = require('./business.service');

class ClubService {

    /**
     * Run Monthly Club Distribution (Cron Job - 1st of Month)
     * Distributes 1% of Global Turnover to qualified members.
     */
    async runMonthlyClubDistribution() {
        console.log('Starting Monthly Club Distribution...');

        // 1. Calculate Global Turnover for previous month
        const today = new Date();
        const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        // Fetch Total Company Business (Sales + Repayments)
        // Ideally we sum all 'Investment' and 'Installment' amounts in that month.
        // For simplicity here, we assume we have a helper or query.
        const globalTurnover = await this.getCompanyTurnover(firstDayPrevMonth, lastDayPrevMonth);

        if (globalTurnover <= 0) {
            console.log('No global turnover, skipping club distribution.');
            return;
        }

        const CLUB_POOL_PERCENT = 1; // 1%
        const poolAmount = (globalTurnover * CLUB_POOL_PERCENT) / 100;

        console.log(`Global Turnover: ${globalTurnover}, Pool Amount (1%): ${poolAmount}`);

        // 2. Define Clubs and Targets
        const clubs = [
            { name: 'Millionaire Club', target: 10000000 }, // 1 Cr
            { name: 'Rising Star Club', target: 25000000 }, // 2.5 Cr
            { name: 'Business Leader Club', target: 50000000 } // 5 Cr
        ];

        for (const club of clubs) {
            await this.processClub(club, poolAmount, firstDayPrevMonth, lastDayPrevMonth);
        }
    }

    async processClub(club, poolAmount, startDate, endDate) {
        // 1. Identify Qualified Users
        // User must have achieved the Accumulated Volume Target
        // User must have maintained 10% New Sales in the previous month

        const qualifiedUsers = [];

        // Iterating all users is expensive. Optimally, we query users who are CLOSE or likely.
        // Or we maintain a 'PotentialClubMembers' list.
        // For now, we iterate all ACTIVE users (MVP approach, caution on scale).
        const users = await User.findAll({ where: { status: 'ACTIVE' } });

        for (const user of users) {
            // A. Check Accumulated Qualification (Standard 40:60 on Team Business)
            const lifetimeVolume = await businessService.calculateQualifiedVolume(user.id, club.target);

            if (lifetimeVolume >= club.target) {
                // B. Check Monthly Maintenance (10% of Target? OR 10% of existing? Prompt says: "10% new sales every month")
                // Usually means: New Business in current month >= 10% of... Target? 
                // 10% of 1 Cr = 10 Lacs new business.
                // Let's assume 10% of the Club Target.

                const maintenanceTarget = club.target * 0.10;
                // Calculate *New* business in the specific month (Not lifetime)
                // We need a helper for 'Monthly Qualified Volume'
                const monthlyVolume = await this.calculateMonthlyVolume(user.id, startDate, endDate);

                if (monthlyVolume >= maintenanceTarget) {
                    qualifiedUsers.push(user);
                }
            }
        }

        if (qualifiedUsers.length === 0) {
            console.log(`No qualifiers for ${club.name}`);
            return;
        }

        // 3. Distribute Pool
        // Equal share of the 1% Pool? Or 1% Pool is shared among ALL clubs?
        // Prompt says: "Club Incentive: 1% monthly pool for Millionaire... etc"
        // Usually means 1% for Millionaire Pool, 1% for Rising Star Pool... 
        // Or 1% Total split? "1% monthly pool for [List]" implies each has its own or 1% total.
        // "Distribute Club Incentives (1%) to qualified members".
        // Let's assume 1% Pool allocated to THIS club specifically (so 3% total if 3 clubs).
        // Standard MLM is 1% Global Turnover allocated to EACH club bucket.

        const sharePerUser = poolAmount / qualifiedUsers.length;

        for (const user of qualifiedUsers) {
            await Income.create({
                userId: user.id,
                amount: sharePerUser,
                incomeType: 'CLUB_INCENTIVE', // Add to Enum
                status: 'APPROVED',
                remarks: `${club.name} Share (Pool: ${poolAmount}, Qualifiers: ${qualifiedUsers.length})`,
                processedAt: new Date(),
                metadata: {
                    clubName: club.name,
                    month: startDate.getMonth() + 1
                }
            });

            // Update Wallet
            const wallet = await Wallet.findOne({ where: { userId: user.id } });
            if (wallet) {
                await wallet.increment('commissionBalance', { by: sharePerUser });
                await wallet.increment('totalEarned', { by: sharePerUser });
            }
        }

        console.log(`Distributed ${poolAmount} for ${club.name} to ${qualifiedUsers.length} users (${sharePerUser} each).`);
    }

    async getCompanyTurnover(startDate, endDate) {
        // Mocking query. Real implementation needs Sum(Investment) + Sum(Installment) in range.
        const { Investment, Installment } = require('../models');
        const invSum = await Investment.sum('totalPaid', {
            where: { createdAt: { [Op.between]: [startDate, endDate] } }
        });
        const instSum = await Installment.sum('amount', {
            where: { paidAt: { [Op.between]: [startDate, endDate] } }
        });
        return (invSum || 0) + (instSum || 0);
    }

    async calculateMonthlyVolume(userId, startDate, endDate) {
        // Simplified volume calculation for just a date range
        // Note: Needs to apply 40:60 rule on the MONTHLY data too? 
        // Usually Maintenance is simpler (Total Group Business).
        // But if "10% new sales", we should probably just check Total Group Business.
        // Let's check "Team Business" in that month.
        // We can reuse businessService logic but filter by date. 
        // (Accessing private/internal logic needed, or adding date params to businessService).
        // For now, returning 0 placeholder to be filled.
        return 0;
    }
}

module.exports = new ClubService();
