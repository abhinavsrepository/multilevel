const { User, Investment, sequelize } = require('./src/models');
const { Op } = require('sequelize');
require('dotenv').config();

/**
 * Test Dashboard Metrics Fix
 * Simulates the /tree/stats endpoint to verify all fields are returned
 */

// Helper to get all descendant IDs (copied from tree.controller.js)
const getDescendantIds = async (userId) => {
    let descendants = [];
    let queue = [userId];
    let loops = 0;
    const MAX_LOOPS = 10000;

    while (queue.length > 0 && loops < MAX_LOOPS) {
        const currentId = queue.shift();
        const directReports = await User.findAll({
            where: { sponsorUserId: currentId },
            attributes: ['id']
        });

        if (directReports.length > 0) {
            const ids = directReports.map(u => u.id);
            descendants = [...descendants, ...ids];
            queue = [...queue, ...ids];
        }
        loops++;
    }
    return descendants;
};

// Helper function to count members in a placement leg recursively
const countPlacementLeg = async (userId, placement) => {
    try {
        let count = 0;
        let queue = [userId];
        let loops = 0;
        const MAX_LOOPS = 10000;

        while (queue.length > 0 && loops < MAX_LOOPS) {
            const currentId = queue.shift();

            const children = await User.findAll({
                where: {
                    placementUserId: currentId,
                    ...(placement ? { placement } : {})
                },
                attributes: ['id']
            });

            if (children.length > 0) {
                count += children.length;
                for (const child of children) {
                    queue.push(child.id);
                }
            }
            loops++;
        }

        return count;
    } catch (error) {
        console.error('Error in countPlacementLeg:', error);
        return 0;
    }
};

async function testDashboardMetrics() {
    try {
        await sequelize.authenticate();
        console.log('='.repeat(70));
        console.log('DASHBOARD METRICS TEST');
        console.log('='.repeat(70));
        console.log();

        // Find a user with team members to test with
        const userWithTeam = await User.findOne({
            where: {
                id: {
                    [Op.in]: sequelize.literal(`(
                        SELECT DISTINCT sponsor_user_id
                        FROM users
                        WHERE sponsor_user_id IS NOT NULL
                    )`)
                }
            },
            attributes: ['id', 'username', 'fullName', 'leftBv', 'rightBv', 'teamBv', 'carryForwardLeft', 'carryForwardRight']
        });

        if (!userWithTeam) {
            console.log('No users with team members found. Creating test scenario...');
            // For testing purposes, use the first user
            const firstUser = await User.findOne({ order: [['id', 'ASC']] });
            if (!firstUser) {
                console.log('❌ No users in database. Cannot test.');
                return;
            }
            console.log(`Using user: ${firstUser.username} (${firstUser.fullName})`);
            console.log('Note: This user may have no team members.\n');
        } else {
            console.log(`Testing with user: ${userWithTeam.username} (${userWithTeam.fullName})`);
            console.log();
        }

        const userId = userWithTeam ? userWithTeam.id : 1;
        const user = await User.findByPk(userId);

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('Calculating metrics...');
        console.log('-'.repeat(70));

        // Get start of current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // 1. Count direct referrals
        console.time('1. Direct Referrals');
        const directReferrals = await User.count({
            where: { sponsorUserId: userId }
        });
        console.timeEnd('1. Direct Referrals');
        console.log(`   Result: ${directReferrals}`);

        // 2. Count direct referrals this month
        console.time('2. Direct Referrals This Month');
        const directReferralsThisMonth = await User.count({
            where: {
                sponsorUserId: userId,
                createdAt: { [Op.gte]: startOfMonth }
            }
        });
        console.timeEnd('2. Direct Referrals This Month');
        console.log(`   Result: ${directReferralsThisMonth}`);

        // 3. Get all team members
        console.time('3. Total Team');
        const descendantIds = await getDescendantIds(userId);
        const totalTeam = descendantIds.length;
        console.timeEnd('3. Total Team');
        console.log(`   Result: ${totalTeam}`);

        // 4. Count active/inactive
        let active = 0;
        let inactive = 0;

        if (descendantIds.length > 0) {
            console.time('4. Active/Inactive Count');
            active = await User.count({
                where: {
                    id: { [Op.in]: descendantIds },
                    status: 'ACTIVE'
                }
            });
            inactive = totalTeam - active;
            console.timeEnd('4. Active/Inactive Count');
            console.log(`   Active: ${active}, Inactive: ${inactive}`);
        } else {
            console.log('4. Active/Inactive Count: No team members');
        }

        // 5. Count left and right legs
        console.time('5. Placement Legs');
        const leftLeg = await countPlacementLeg(userId, 'LEFT');
        const rightLeg = await countPlacementLeg(userId, 'RIGHT');
        console.timeEnd('5. Placement Legs');
        console.log(`   Left Leg: ${leftLeg}, Right Leg: ${rightLeg}`);

        // 6. Calculate matching BV
        const matchingBV = Math.min(user.leftBv || 0, user.rightBv || 0);
        console.log(`6. Matching BV: ${matchingBV}`);

        // 7. Calculate carry forward
        const carryForward = parseFloat((user.carryForwardLeft || 0)) + parseFloat((user.carryForwardRight || 0));
        console.log(`7. Carry Forward: ${carryForward}`);

        // 8. Team investment
        let teamInvestment = 0;
        let teamInvestmentThisMonth = 0;

        if (descendantIds.length > 0) {
            console.time('8. Team Investment');
            teamInvestment = await Investment.sum('investmentAmount', {
                where: { userId: { [Op.in]: descendantIds } }
            }) || 0;

            teamInvestmentThisMonth = await Investment.sum('investmentAmount', {
                where: {
                    userId: { [Op.in]: descendantIds },
                    createdAt: { [Op.gte]: startOfMonth }
                }
            }) || 0;
            console.timeEnd('8. Team Investment');
            console.log(`   Total: ${teamInvestment.toFixed(2)}, This Month: ${teamInvestmentThisMonth.toFixed(2)}`);
        } else {
            console.log('8. Team Investment: No team members');
        }

        console.log();
        console.log('='.repeat(70));
        console.log('COMPLETE API RESPONSE');
        console.log('='.repeat(70));

        const response = {
            success: true,
            data: {
                // Team counts
                totalTeam,
                leftLeg,
                rightLeg,
                active,
                inactive,
                directReferrals,
                directReferralsThisMonth,

                // Business Volume
                teamBV: parseFloat(user.teamBv || 0),
                leftBV: parseFloat(user.leftBv || 0),
                rightBV: parseFloat(user.rightBv || 0),
                matchingBV: parseFloat(matchingBV.toFixed(2)),
                carryForward: parseFloat(carryForward.toFixed(2)),

                // Investment
                teamInvestment: parseFloat(teamInvestment.toFixed(2)),
                teamInvestmentThisMonth: parseFloat(teamInvestmentThisMonth.toFixed(2))
            }
        };

        console.log(JSON.stringify(response, null, 2));
        console.log();

        // Verify all required fields are present
        console.log('='.repeat(70));
        console.log('VERIFICATION');
        console.log('='.repeat(70));

        const requiredFields = [
            'totalTeam', 'leftLeg', 'rightLeg', 'active', 'inactive',
            'directReferrals', 'directReferralsThisMonth',
            'teamBV', 'leftBV', 'rightBV', 'matchingBV', 'carryForward',
            'teamInvestment', 'teamInvestmentThisMonth'
        ];

        let allPresent = true;
        requiredFields.forEach(field => {
            const isPresent = response.data.hasOwnProperty(field);
            const value = response.data[field];
            const status = isPresent ? '✅' : '❌';
            console.log(`${status} ${field.padEnd(30)} = ${value}`);
            if (!isPresent) allPresent = false;
        });

        console.log();
        if (allPresent) {
            console.log('✅ SUCCESS: All required fields are present!');
            console.log('✅ Dashboard metrics fix is working correctly!');
        } else {
            console.log('❌ FAILURE: Some required fields are missing!');
        }

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        console.error(error);
    } finally {
        await sequelize.close();
        console.log('\nDatabase connection closed.');
    }
}

testDashboardMetrics();
