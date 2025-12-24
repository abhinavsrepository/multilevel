const { User, Investment, Installment, sequelize } = require('../models');
const { Op } = require('sequelize');

class BusinessService {

    /**
     * Calculate Total Business Volume for a user (Personal + Team)
     * Limit depth if needed, but usually this is infinite depth for rank.
     * Business = Valid Investments + Paid Installments
     */
    async getUserTotalBusiness(userId) {
        // 1. Direct Investments by this user
        const investmentTotal = await Investment.sum('totalPaid', {
            where: {
                userId: userId,
                // Only count valid business
                investmentStatus: { [Op.notIn]: ['CANCELLED'] },
                bookingStatus: 'CONFIRMED'
            }
        });

        // 2. Paid Installments by this user
        const installmentTotal = await Installment.sum('amount', {
            where: {
                userId: userId,
                status: 'PAID'
            }
        });

        return (parseFloat(investmentTotal || 0) + parseFloat(installmentTotal || 0));
    }

    /**
     * Get Recursive Downline Volume for a user (Group Business Volume)
     * Does NOT include the user's own personal business (usually).
     * If existing logic says "Team Business" includes personal, I will add it.
     * Ranks usually rely on "Team Business" (Downline).
     */
    async getDownlineTotal(userId) {
        // Find all direct referrals
        const directReferrals = await User.findAll({
            where: { sponsorId: userId },
            attributes: ['id']
        });

        let totalVolume = 0;

        for (const referral of directReferrals) {
            // Volume of the referral themselves
            const referralPersonal = await this.getUserTotalBusiness(referral.id);

            // Volume of their downline (Recursive)
            const referralTeam = await this.getDownlineTotal(referral.id);

            totalVolume += (referralPersonal + referralTeam);
        }

        return totalVolume;
    }

    /**
     * Calculate Qualified Volume for Rank/Club Targets
     * Enforces the 40:60 Balancing Rule
     * Max 60% from Strongest Leg
     * Min 40% (implied) from Rest
     */
    async calculateQualifiedVolume(userId, targetAmount) {
        const directLegs = await User.findAll({
            where: { sponsorId: userId },
            attributes: ['id', 'username', 'firstName', 'lastName']
        });

        let legVolumes = [];

        for (const leg of directLegs) {
            // For a "Leg", the volume is the User's Personal + Their Downline
            const legPersonal = await this.getUserTotalBusiness(leg.id);
            const legTeam = await this.getDownlineTotal(leg.id);
            const totalLegVolume = legPersonal + legTeam;

            legVolumes.push({
                legId: leg.id,
                username: leg.username,
                volume: totalLegVolume
            });
        }

        // Sort desc to find strongest
        legVolumes.sort((a, b) => b.volume - a.volume);

        if (legVolumes.length === 0) return 0;

        const strongestLeg = legVolumes[0];
        const strongestVolume = strongestLeg.volume;

        // Sum of all other legs
        const otherLegsVolume = legVolumes.slice(1).reduce((sum, leg) => sum + leg.volume, 0);

        // Apply 40:60 Cap
        // Max from Strong Leg = 60% of Target
        const maxStrongLegAllowed = targetAmount * 0.60;
        const cappedStrongVolume = Math.min(strongestVolume, maxStrongLegAllowed);

        // Required from Other Legs = 40% of Target (implicitly enforcing balance)
        // If otherLegsVolume is LOW, they won't meet the target.
        // We just sum what we have. If (cappedStrong + other) >= Target, they qualify.

        // Wait, the "Qualified Volume" is just the sum of Capped Strong + others.
        // If this sum >= Target, they pass.
        // But we technically also cap "Other Legs"?
        // Prompt says: "Weak Leg Minimum: A minimum of 40% of the target must be sourced from combined volume of all other legs"
        // This implies: Even if Strong Leg has 1000% of volume, we only count 60%.
        // AND even if we have enough volume in Strong, we NEED other legs to contribute.

        // Actually, the "Qualified Volume" formula in the prompt is:
        // const cappedOtherLegs = Math.min(otherLegs, targetAmount * 0.4); 
        // return (cappedStrongLeg + cappedOtherLegs);

        // This formula implies a strict cap on BOTH sides for the PURPOSE of meeting the target.
        // If Target is 1000. 600 max from Strong. 400 max from Weak.
        // If Strong has 500, Weak has 500. Result: 500 + 400 = 900. (Fails? Wait)
        // If Strong has 500, Weak has 500. They have 1000 total. 
        // Formula: min(500, 600) + min(500, 400) = 500 + 400 = 900.

        // Is that right? "Weak Leg Minimum of 40%". 
        // If I have 500 strong, 500 weak. 
        // I should have 1000 total.
        // Logic: You need 400 from weak. I have 500. Good.
        // Logic: You need 600 from strong. I have 500. Good.
        // Total qualified = 900. 
        // So I need MORE volume to reach 1000 if I am balanced 50/50?
        // Usually, 40:60 rule means: "No more than 60% of volume can come from one leg".
        // It DOES NOT usually mean "No more than 40% can come from weak legs".
        // The prompt says: "Weak Leg Minimum: A minimum of 40% of the target must be sourced from..."
        // This confirms the Requirement.
        // But the provided CODE SNIPPET does: `const cappedOtherLegs = Math.min(otherLegs, targetAmount * 0.4);`
        // This snippet strictly caps the contribution of weak legs to 40% of the target.
        // This makes it HARDER to qualify if you are perfectly balanced?
        // Let's re-read carefully: "A minimum of 40% of the target must be sourced from..."
        // If I need 1000. 400 MUST come from weak.
        // If I have 1000 weak, 0 strong.
        // cappedStrong = 0. cappedWeak = 400. Total = 400. Fail.
        // If I have 500 weak, 500 strong.
        // cappedStrong = 500. cappedWeak = 400. Total = 900. Fail.
        // To get 1000:
        // I need e.g. 600 Strong, 400 Weak. -> 600 + 400 = 1000. Pass.
        // I need e.g. 1000 Strong, 1000 Weak. -> 600 + 400 = 1000. Pass.

        // This logic implementation in the prompt is what I must follow.
        const cappedOtherLegs = Math.min(otherLegsVolume, targetAmount * 0.4);

        return (cappedStrongVolume + cappedOtherLegs);
    }
}

module.exports = new BusinessService();
