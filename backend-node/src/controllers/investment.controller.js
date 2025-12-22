const { Investment, Property, User } = require('../models');
const { Op } = require('sequelize');
const commissionService = require('../services/commission.service');

exports.createInvestment = async (req, res) => {
    try {
        const { propertyId, amount, investmentType } = req.body;
        const userId = req.user.id;

        // Check property
        const property = await Property.findByPk(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Create investment
        const investment = await Investment.create({
            investmentId: 'INV' + Date.now(),
            propertyId,
            userId,
            investmentAmount: amount,
            investmentType,
            investmentStatus: 'ACTIVE',
            bookingStatus: 'CONFIRMED',
            totalPaid: amount // Assuming full payment for now
        });

        // Auto-activate user on first sale
        const user = await User.findByPk(userId);
        if (user && user.status === 'INACTIVE') {
            // Check if this is their first investment
            const investmentCount = await Investment.count({ where: { userId } });
            if (investmentCount === 1) { // This is their first investment
                await user.update({ status: 'ACTIVE' });
                console.log(`User ${user.username} auto-activated after first sale`);
            }
        }

        // Update property slots
        await property.increment('slotsBooked');

        // Calculate and distribute commissions
        // We don't await this to avoid blocking the response, or we can await if critical
        commissionService.calculateLevelCommission(investment);

        res.status(201).json({ success: true, data: investment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getMyInvestments = async (req, res) => {
    try {
        let { page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC' } = req.query;

        // Handle pagination
        const limit = parseInt(size);
        const offset = parseInt(page) * limit;

        // Handle sorting
        let order = [['createdAt', 'DESC']];
        if (sortBy === 'investmentDate') {
            order = [['createdAt', sortDirection.toUpperCase()]];
        } else if (sortBy === 'investmentAmount') {
            order = [['investmentAmount', sortDirection.toUpperCase()]];
        } else if (sortBy === 'currentValue') {
            order = [['currentValue', sortDirection.toUpperCase()]];
        } else if (sortBy !== 'createdAt') {
            // Fallback for other fields if they exist in model
            order = [[sortBy, sortDirection.toUpperCase()]];
        }

        const { count, rows } = await Investment.findAndCountAll({
            where: { userId: req.user.id },
            include: [{ model: Property }],
            limit,
            offset,
            order
        });

        // Structure matches PaginatedResponse<Investment>
        // apiGet returns response.data, so we need to return the object that matches PaginatedResponse
        // But usually backend returns { success: true, data: ... }
        // If apiGet returns response.data, then T is the whole body.
        // PaginatedResponse<T> usually has content, totalPages, totalElements.
        // So we should return { success: true, data: { content: rows, ... } }
        // And the frontend T will be { content: ..., ... }
        // Wait, if T is PaginatedResponse, and apiGet returns response.data (the body),
        // then the body MUST be PaginatedResponse.
        // But our backend standard is { success: true, data: ... }.
        // This implies T = { success: boolean, data: PaginatedResponse }.
        // But the frontend code says:
        // const response = await getInvestments(params); // response is T
        // if (response.data) { ... }
        // This implies T has a .data property.
        // So if T is PaginatedResponse, it should have .data? No.
        // Let's look at investment.api.ts again.
        // export const getInvestments = ... : Promise<PaginatedResponse<Investment>>
        // return apiGet<PaginatedResponse<Investment>>...
        // If PaginatedResponse is defined as { data: { content: ... } }, then it matches.
        // But usually PaginatedResponse is { content: [], totalPages: ... }.
        // If the backend returns { success: true, data: { content: ... } }
        // Then apiGet returns { success: true, data: { content: ... } }
        // Then response.data refers to the inner data?
        // In MyInvestments.tsx: if (response.data) ... setInvestments(response.data.content)
        // This means response has a .data property, which has .content.
        // So T (the return of apiGet) has .data.
        // So T = { data: { content: ... } }.
        // So PaginatedResponse<Investment> probably extends ApiResponse or similar.
        // Let's assume the standard { success: true, data: ... } wrapper is correct.

        res.json({
            success: true,
            data: {
                content: rows,
                totalPages: Math.ceil(count / limit),
                totalElements: count,
                size: limit,
                number: parseInt(page)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getInvestmentDetails = async (req, res) => {
    try {
        const investment = await Investment.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Property }]
        });

        if (investment) {
            res.json({ success: true, data: investment });
        } else {
            res.status(404).json({ success: false, message: 'Investment not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPortfolioSummary = async (req, res) => {
    try {
        const investments = await Investment.findAll({
            where: { userId: req.user.id, investmentStatus: 'ACTIVE' }
        });

        const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.investmentAmount), 0);
        const totalCurrentValue = investments.reduce((sum, inv) => sum + (parseFloat(inv.currentValue) || parseFloat(inv.investmentAmount)), 0);

        res.json({
            success: true,
            data: {
                totalInvested,
                totalCurrentValue,
                activeInvestments: investments.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.requestExit = async (req, res) => {
    try {
        const investment = await Investment.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!investment) {
            return res.status(404).json({ success: false, message: 'Investment not found' });
        }

        if (investment.exitRequested) {
            return res.status(400).json({ success: false, message: 'Exit already requested' });
        }

        // Check lock-in period (simplified logic)
        if (investment.lockInEndDate && new Date() < new Date(investment.lockInEndDate)) {
            return res.status(400).json({ success: false, message: 'Lock-in period not over' });
        }

        await investment.update({ exitRequested: true });

        res.json({ success: true, message: 'Exit request submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getInvestmentStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const investments = await Investment.findAll({
            where: { userId }
        });

        const totalInvestments = investments.length;
        const totalAmount = investments.reduce((sum, inv) => sum + parseFloat(inv.investmentAmount || 0), 0);
        const activeInvestments = investments.filter(inv => inv.investmentStatus === 'ACTIVE').length;

        // Count unique properties
        const uniqueProperties = new Set(investments.map(inv => inv.propertyId));
        const totalProperties = uniqueProperties.size;

        // Calculate returns
        const totalReturns = investments.reduce((sum, inv) =>
            sum + parseFloat(inv.roiEarned || 0) + parseFloat(inv.rentalIncomeEarned || 0) + parseFloat(inv.capitalGains || 0), 0);

        // Calculate average ROI
        let totalROI = 0;
        let count = 0;
        investments.forEach(inv => {
            const invested = parseFloat(inv.investmentAmount || 0);
            if (invested > 0) {
                const returns = parseFloat(inv.roiEarned || 0) + parseFloat(inv.rentalIncomeEarned || 0) + parseFloat(inv.capitalGains || 0);
                totalROI += (returns / invested) * 100;
                count++;
            }
        });
        const averageROI = count > 0 ? totalROI / count : 0;

        res.json({
            success: true,
            data: {
                totalInvestments,
                totalAmount,
                activeInvestments,
                totalProperties,
                averageROI,
                totalReturns
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
