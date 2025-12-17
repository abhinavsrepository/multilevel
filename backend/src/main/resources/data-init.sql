-- =====================================================
-- MLM Real Estate Platform - Database Initialization Script
-- =====================================================
-- This script initializes default data for the application
-- Run this after the database schema is created by Hibernate

-- =====================================================
-- System Settings
-- =====================================================
INSERT INTO system_setting (id, setting_key, setting_value, setting_type, description, created_at, updated_at)
VALUES
    (1, 'level_commission_percentages', '3.0,2.0,1.5,1.0,1.0,0.5,0.5,0.5,0.5,0.5', 'STRING', 'Commission percentages for level 1-10', NOW(), NOW()),
    (2, 'binary_pairing_bonus', '100.00', 'DECIMAL', 'Bonus amount per binary pair', NOW(), NOW()),
    (3, 'binary_daily_cap', '25000.00', 'DECIMAL', 'Daily commission cap in INR', NOW(), NOW()),
    (4, 'binary_weekly_cap', '150000.00', 'DECIMAL', 'Weekly commission cap in INR', NOW(), NOW()),
    (5, 'direct_referral_percent', '2.00', 'DECIMAL', 'Direct referral commission percentage', NOW(), NOW()),
    (6, 'min_withdrawal', '1000.00', 'DECIMAL', 'Minimum withdrawal amount in INR', NOW(), NOW()),
    (7, 'max_daily_withdrawal', '100000.00', 'DECIMAL', 'Maximum daily withdrawal amount in INR', NOW(), NOW()),
    (8, 'tds_percent', '10.00', 'DECIMAL', 'TDS percentage on withdrawals', NOW(), NOW()),
    (9, 'admin_charge_percent', '2.00', 'DECIMAL', 'Admin charge percentage on withdrawals', NOW(), NOW()),
    (10, 'min_investment', '50000.00', 'DECIMAL', 'Minimum investment amount in INR', NOW(), NOW()),
    (11, 'lock_in_period_months', '12', 'INTEGER', 'Lock-in period for investments in months', NOW(), NOW()),
    (12, 'max_roi_cap_percent', '300.00', 'DECIMAL', 'Maximum ROI cap percentage', NOW(), NOW())
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- Rank Settings
-- =====================================================
INSERT INTO rank_setting (id, rank_name, min_direct_referrals, min_team_bv, min_personal_bv, monthly_bonus, benefits, is_active, created_at, updated_at)
VALUES
    (1, 'Associate', 0, 0, 0, 0, 'Basic membership benefits', true, NOW(), NOW()),
    (2, 'Executive', 2, 50000, 10000, 2000, 'Priority support, Executive badge', true, NOW(), NOW()),
    (3, 'Silver', 5, 200000, 25000, 5000, 'Silver benefits, Higher commission rates', true, NOW(), NOW()),
    (4, 'Gold', 10, 500000, 50000, 10000, 'Gold benefits, Quarterly bonus, Leadership training', true, NOW(), NOW()),
    (5, 'Platinum', 20, 1000000, 100000, 25000, 'Platinum benefits, Annual incentive trip, Car fund', true, NOW(), NOW()),
    (6, 'Diamond', 50, 5000000, 250000, 50000, 'Diamond club, International trip, House fund', true, NOW(), NOW())
ON CONFLICT (rank_name) DO NOTHING;

-- =====================================================
-- Create Admin User
-- =====================================================
-- Password: admin123 (BCrypt hashed with strength 12)
-- You should change this password after first login!
INSERT INTO users (
    id, user_id, full_name, email, mobile, password, date_of_birth, gender,
    address, city, state, pincode, country, level, rank, status, role,
    email_verified, mobile_verified, kyc_status, kyc_level, referral_code,
    left_bv, right_bv, carry_forward_left, carry_forward_right, personal_bv, team_bv,
    total_investment, total_earnings, total_withdrawn,
    created_at, updated_at
)
VALUES (
    1, 'ADMIN001', 'System Administrator', 'admin@mlm-platform.com', '9999999999',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYGo4cVLQ3m', '1990-01-01', 'MALE',
    'Admin Office', 'Mumbai', 'Maharashtra', '400001', 'India', 0, 'Diamond', 'ACTIVE', 'ADMIN',
    true, true, 'FULL', 'PREMIUM', 'ADMIN001',
    0, 0, 0, 0, 0, 0,
    0, 0, 0,
    NOW(), NOW()
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- Create Wallet for Admin User
-- =====================================================
INSERT INTO wallets (
    id, user_id, investment_balance, commission_balance, rental_income_balance, roi_balance,
    total_earned, total_withdrawn, total_invested, locked_balance,
    created_at, updated_at
)
SELECT
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = 1);

-- =====================================================
-- Sample Properties (Optional - for demo purposes)
-- =====================================================
INSERT INTO properties (
    id, property_id, title, description, property_type, property_category,
    address, city, state, pincode, total_area, built_up_area,
    bedrooms, bathrooms, facing, furnishing_status,
    base_price, investment_price, minimum_investment, total_investment_slots, slots_booked,
    direct_referral_commission_percent, bv_value, expected_roi_percent, roi_tenure_months,
    status, is_verified, created_at, updated_at
)
VALUES
    (1, 'PROP001', 'Luxury Apartment in Bandra West',
     'Premium 3BHK apartment with sea view, modern amenities',
     'RESIDENTIAL', 'APARTMENT',
     'Bandra West, Mumbai', 'Mumbai', 'Maharashtra', '400050',
     1500.00, 1200.00, 3, 2, 'WEST', 'FURNISHED',
     25000000.00, 5000000.00, 50000.00, 100, 0,
     2.00, 500000.00, 15.00, 36,
     'ACTIVE', true, NOW(), NOW()),

    (2, 'PROP002', 'Commercial Space in Connaught Place',
     'Prime commercial property in heart of Delhi',
     'COMMERCIAL', 'COMMERCIAL',
     'Connaught Place, New Delhi', 'New Delhi', 'Delhi', '110001',
     2000.00, 1800.00, 0, 0, 'NORTH', 'SEMI_FURNISHED',
     50000000.00, 10000000.00, 100000.00, 50, 0,
     3.00, 1000000.00, 18.00, 48,
     'ACTIVE', true, NOW(), NOW())
ON CONFLICT (property_id) DO NOTHING;

-- =====================================================
-- Reset sequences (PostgreSQL specific)
-- =====================================================
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false);
SELECT setval('wallets_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM wallets), false);
SELECT setval('system_setting_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM system_setting), false);
SELECT setval('rank_setting_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM rank_setting), false);
SELECT setval('properties_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM properties), false);

COMMIT;

-- =====================================================
-- Initialization Complete!
-- =====================================================
-- Admin Credentials:
-- Email: admin@mlm-platform.com
-- Password: admin123
--
-- IMPORTANT: Change the admin password after first login!
-- =====================================================
