const { User, Property, Investment, Commission, Wallet, sequelize } = require('../src/models');
const commissionService = require('../src/services/commission.service');

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Create Sponsor
        const sponsor = await User.create({
            username: `sponsor_${Date.now()}`,
            email: `sponsor_${Date.now()}@test.com`,
            password: 'password123',
            firstName: 'Sponsor',
            lastName: 'User',
            role: 'USER',
            status: 'ACTIVE'
        });
        console.log('Sponsor created:', sponsor.id);

        // Create Wallet for Sponsor
        await Wallet.create({ userId: sponsor.id });

        // 2. Create Investor (Downline)
        const investor = await User.create({
            username: `investor_${Date.now()}`,
            email: `investor_${Date.now()}@test.com`,
            password: 'password123',
            firstName: 'Investor',
            lastName: 'User',
            role: 'USER',
            status: 'ACTIVE',
            sponsorId: sponsor.id
        });
        console.log('Investor created:', investor.id);

        // 3. Create Property
        const property = await Property.create({
            propertyId: `PROP-${Date.now()}`,
            title: 'Test Property',
            description: 'Test Description',
            propertyType: 'RESIDENTIAL',
            propertyCategory: 'APARTMENT',
            address: 'Test Address',
            city: 'Test City',
            state: 'Test State',
            basePrice: 100000,
            totalInvestmentSlots: 100,
            status: 'ACTIVE'
        });
        console.log('Property created:', property.id);

        // 4. Create Investment
        const investment = await Investment.create({
            investmentId: `INV-${Date.now()}`,
            propertyId: property.id,
            userId: investor.id,
            investmentAmount: 1000,
            investmentType: 'ONE_TIME',
            investmentStatus: 'ACTIVE',
            bookingStatus: 'CONFIRMED',
            totalPaid: 1000
        });
        console.log('Investment created:', investment.id);

        // 5. Trigger Commission Calculation
        console.log('Triggering commission calculation...');
        await commissionService.calculateLevelCommission(investment);

        // 6. Verify Commission
        const commission = await Commission.findOne({
            where: {
                userId: sponsor.id,
                fromUserId: investor.id,
                level: 1
            }
        });

        if (commission) {
            console.log('SUCCESS: Commission record found!');
            console.log('Amount:', commission.amount);
            console.log('Type:', commission.commissionType);
        } else {
            console.error('FAILURE: Commission record NOT found.');
        }

        // 7. Verify Wallet
        const wallet = await Wallet.findOne({ where: { userId: sponsor.id } });
        if (wallet && parseFloat(wallet.commissionBalance) > 0) {
            console.log('SUCCESS: Wallet updated!');
            console.log('Commission Balance:', wallet.commissionBalance);
        } else {
            console.error('FAILURE: Wallet NOT updated correctly.');
            console.log('Wallet:', wallet ? wallet.toJSON() : 'null');
        }

    } catch (error) {
        console.error('Error verifying commission:', error);
    } finally {
        await sequelize.close();
    }
}

verify();
