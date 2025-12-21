const { User, Property, Investment, sequelize } = require('./src/models');

async function seedInvestment() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // 1. Find User
        const user = await User.findOne({ where: { email: 'customer@test.com' } });
        if (!user) {
            console.error('User customer@test.com not found. Run seed_customer.js first.');
            return;
        }
        console.log('User found:', user.id);

        // 2. Create Property
        const property = await Property.create({
            propertyId: 'PROP-' + Math.floor(Math.random() * 10000),
            title: 'Luxury Villa in Downtown',
            propertyType: 'VILLA',
            propertyCategory: 'RESIDENTIAL',
            address: '123 Luxury Lane',
            city: 'Metropolis',
            state: 'NY',
            basePrice: 500000,
            totalInvestmentSlots: 10,
            status: 'ACTIVE',
            images: ['https://via.placeholder.com/800x600']
        });
        console.log('Property created:', property.id);

        // 3. Create Investment (Booking)
        const investment = await Investment.create({
            investmentId: 'INV-' + Math.floor(Math.random() * 10000),
            propertyId: property.id,
            userId: user.id,
            investmentAmount: 50000,
            investmentType: 'PARTIAL',
            status: 'ACTIVE',
            investmentStatus: 'ACTIVE',
            bookingStatus: 'CONFIRMED',
            paymentMethod: 'BANK_TRANSFER',
            paymentGatewayRef: 'TXN123456',
            agreementNumber: 'AGR-' + Math.floor(Math.random() * 10000),
            agreementDate: new Date(),
            totalInstallments: 12,
            installmentsPaid: 2,
            installmentAmount: 4500,
            totalPaid: 9000,
            pendingAmount: 41000,
            nextInstallmentDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        });
        console.log('Investment created:', investment.id);

    } catch (err) {
        console.error('SEED ERROR:', err);
    } finally {
        await sequelize.close();
    }
}

seedInvestment();
