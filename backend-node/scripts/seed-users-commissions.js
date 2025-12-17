const { User, Property, Investment, Commission, Wallet, LevelCommissionRule, sequelize } = require('../src/models');
const commissionService = require('../src/services/commission.service');
const bcrypt = require('bcryptjs');

async function seed() {
    const transaction = await sequelize.transaction();
    try {
        console.log('Database connected. Starting seed...');

        // 1. Ensure Commission Rules exist (or create them)
        const rulesCount = await LevelCommissionRule.count();
        if (rulesCount === 0) {
            console.log('Seeding Commission Rules...');
            await LevelCommissionRule.bulkCreate([
                { level: 1, commissionType: 'PERCENTAGE', value: 10, isActive: true },
                { level: 2, commissionType: 'PERCENTAGE', value: 5, isActive: true },
                { level: 3, commissionType: 'PERCENTAGE', value: 3, isActive: true },
                { level: 4, commissionType: 'PERCENTAGE', value: 2, isActive: true },
                { level: 5, commissionType: 'PERCENTAGE', value: 1, isActive: true },
            ], { transaction });
        }

        // 2. Create Hierarchy of Users (Level 1 to Level 5)
        // Root User (Top of the chain)
        const rootUser = await User.create({
            username: `root_${Date.now()}`,
            email: `root_${Date.now()}@test.com`,
            password: 'password123',
            firstName: 'Root',
            lastName: 'User',
            role: 'USER',
            status: 'ACTIVE'
        }, { transaction });
        await Wallet.create({ userId: rootUser.id }, { transaction });
        console.log(`Created Root User: ${rootUser.username} (${rootUser.id})`);

        let currentUser = rootUser;
        const usersChain = [rootUser];

        // Create 5 levels of downlines
        for (let i = 1; i <= 5; i++) {
            const downline = await User.create({
                username: `user_lvl${i}_${Date.now()}`,
                email: `user_lvl${i}_${Date.now()}@test.com`,
                password: 'password123',
                firstName: `Level${i}`,
                lastName: 'User',
                role: 'USER',
                status: 'ACTIVE',
                sponsorId: currentUser.id
            }, { transaction });
            await Wallet.create({ userId: downline.id }, { transaction });
            console.log(`Created Level ${i} User: ${downline.username} (${downline.id}) -> Sponsor: ${currentUser.username}`);

            usersChain.push(downline);
            currentUser = downline;
        }

        // The last user in the chain is the one investing
        const investor = usersChain[usersChain.length - 1];
        console.log(`Investor is: ${investor.username} (${investor.id})`);

        // 3. Create a Property
        const property = await Property.create({
            propertyId: `PROP-SEED-${Date.now()}`,
            title: 'Premium Seed Property',
            description: 'A property created for seeding commissions',
            propertyType: 'COMMERCIAL',
            propertyCategory: 'OFFICE',
            address: '123 Seed Street',
            city: 'Seed City',
            state: 'Seed State',
            basePrice: 500000,
            totalInvestmentSlots: 500,
            status: 'ACTIVE'
        }, { transaction });
        console.log(`Created Property: ${property.title} (${property.id})`);

        // 4. Create Investment
        const investmentAmount = 10000;
        const investment = await Investment.create({
            investmentId: `INV-SEED-${Date.now()}`,
            propertyId: property.id,
            userId: investor.id,
            investmentAmount: investmentAmount,
            investmentType: 'ONE_TIME',
            investmentStatus: 'ACTIVE',
            bookingStatus: 'CONFIRMED',
            totalPaid: investmentAmount
        }, { transaction });
        console.log(`Created Investment of $${investmentAmount} for ${investor.username}`);

        await transaction.commit();
        console.log('Transaction committed. Triggering commission calculation...');

        // 5. Trigger Commission Calculation (Outside transaction to simulate async process)
        await commissionService.calculateLevelCommission(investment);

        console.log('---------------------------------------------------');
        console.log('VERIFICATION RESULTS:');
        console.log('---------------------------------------------------');

        // 6. Verify Commissions
        // We expect commissions for the uplines.
        // Investor is at index 5 (Level 5 relative to root, but let's trace back)
        // usersChain = [Root, Lvl1, Lvl2, Lvl3, Lvl4, Lvl5(Investor)]
        // Sponsor of Investor is Lvl4 -> Should get Level 1 Commission (10%)
        // Sponsor of Lvl4 is Lvl3 -> Should get Level 2 Commission (5%)
        // ... and so on.

        const uplines = usersChain.slice(0, usersChain.length - 1).reverse();
        // uplines = [Lvl4, Lvl3, Lvl2, Lvl1, Root]

        for (let i = 0; i < uplines.length; i++) {
            const upline = uplines[i];
            const level = i + 1; // 1, 2, 3...

            const commission = await Commission.findOne({
                where: {
                    userId: upline.id,
                    fromUserId: investor.id,
                    level: level
                }
            });

            if (commission) {
                console.log(`[SUCCESS] Level ${level} Commission for ${upline.username}: $${commission.amount} (${commission.percentage}%)`);
            } else {
                // We only seeded 5 levels of rules, so if we go deeper, we might not see commissions if rules don't exist
                const ruleExists = await LevelCommissionRule.findOne({ where: { level } });
                if (ruleExists) {
                    console.error(`[FAILURE] Missing Level ${level} Commission for ${upline.username}`);
                } else {
                    console.log(`[INFO] No rule for Level ${level}, so no commission expected for ${upline.username}`);
                }
            }
        }

        console.log('Seeding and Verification Completed.');

    } catch (error) {
        await transaction.rollback();
        console.error('Error during seeding:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
