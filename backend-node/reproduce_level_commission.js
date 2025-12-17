const { sequelize, User, LevelCommissionRule, Investment, Commission } = require('./src/models');
const commissionService = require('./src/services/commission.service');

async function runVerification() {
    try {
        console.log('--- Starting Level Commission Verification ---');

        // 1. Setup Database
        await sequelize.sync({ force: false }); // Don't drop tables, just sync

        // 2. Create Users (Grandparent -> Parent -> Child)
        const timestamp = Date.now();
        const grandparent = await User.create({
            username: `gp_${timestamp}`,
            email: `gp_${timestamp}@test.com`,
            password: 'password123',
            firstName: 'Grand',
            lastName: 'Parent',
            role: 'USER',
            referralCode: `GP${timestamp}`,
            rank: 'Silver' // Give rank to test rank requirements
        });

        const parent = await User.create({
            username: `p_${timestamp}`,
            email: `p_${timestamp}@test.com`,
            password: 'password123',
            firstName: 'Parent',
            lastName: 'User',
            role: 'USER',
            referralCode: `P${timestamp}`,
            sponsorId: grandparent.id,
            rank: 'Bronze'
        });

        const child = await User.create({
            username: `c_${timestamp}`,
            email: `c_${timestamp}@test.com`,
            password: 'password123',
            firstName: 'Child',
            lastName: 'User',
            role: 'USER',
            referralCode: `C${timestamp}`,
            sponsorId: parent.id,
            rank: 'Member'
        });

        console.log(`Created Hierarchy: ${grandparent.username} -> ${parent.username} -> ${child.username}`);

        // 3. Setup Commission Rules
        // Clear existing rules for clean test
        await LevelCommissionRule.destroy({ where: {} });

        await LevelCommissionRule.bulkCreate([
            { level: 1, commissionType: 'PERCENTAGE', value: 10.00, isActive: true }, // Parent gets 10%
            { level: 2, commissionType: 'PERCENTAGE', value: 5.00, isActive: true, requiredRank: 'Silver' }   // Grandparent gets 5% (requires Silver)
        ]);

        console.log('Created Commission Rules: Level 1 (10%), Level 2 (5% - Silver req)');

        // 4. Create Investment
        const investmentAmount = 10000;
        const investment = await Investment.create({
            investmentId: `INV_${timestamp}`,
            propertyId: 'PROP_TEST',
            userId: child.id,
            investmentAmount: investmentAmount,
            investmentType: 'ONE_TIME',
            investmentStatus: 'ACTIVE',
            bookingStatus: 'CONFIRMED',
            totalPaid: investmentAmount
        });

        console.log(`Created Investment of ${investmentAmount} for ${child.username}`);

        // 5. Trigger Commission Calculation
        await commissionService.calculateLevelCommission(investment);

        // 6. Verify Commissions
        const commissions = await Commission.findAll({
            where: { fromUserId: child.id },
            order: [['level', 'ASC']]
        });

        console.log('\n--- Verification Results ---');
        if (commissions.length === 0) {
            console.error('FAILED: No commissions created.');
        } else {
            commissions.forEach(comm => {
                console.log(`Level ${comm.level}: Paid to User ID ${comm.userId} | Amount: ${comm.amount} | Type: ${comm.commissionType}`);
            });

            // Specific checks
            const level1 = commissions.find(c => c.level === 1);
            const level2 = commissions.find(c => c.level === 2);

            let success = true;

            if (!level1) {
                console.error('FAILED: Level 1 commission missing.');
                success = false;
            } else if (parseFloat(level1.amount) !== 1000.00) {
                console.error(`FAILED: Level 1 amount incorrect. Expected 1000, got ${level1.amount}`);
                success = false;
            } else if (level1.userId !== parent.id) { // Use BigInt comparison if needed, but strict equality usually works with sequelize objects
                // Note: Sequelize might return string for BigInt, so use == or toString()
                if (level1.userId.toString() !== parent.id.toString()) {
                    console.error(`FAILED: Level 1 paid to wrong user. Expected ${parent.id}, got ${level1.userId}`);
                    success = false;
                }
            }

            if (!level2) {
                console.error('FAILED: Level 2 commission missing.');
                success = false;
            } else if (parseFloat(level2.amount) !== 500.00) {
                console.error(`FAILED: Level 2 amount incorrect. Expected 500, got ${level2.amount}`);
                success = false;
            } else if (level2.userId.toString() !== grandparent.id.toString()) {
                console.error(`FAILED: Level 2 paid to wrong user. Expected ${grandparent.id}, got ${level2.userId}`);
                success = false;
            }

            if (success) {
                console.log('\nSUCCESS: All commissions calculated correctly!');
            }
        }

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        // Cleanup (Optional, maybe keep for inspection)
        // await sequelize.close();
        process.exit();
    }
}

runVerification();
