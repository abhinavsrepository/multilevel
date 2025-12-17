-- Real Estate MLM Platform Database Schema
-- PostgreSQL 15+
-- Created: 2024

-- Drop existing tables if they exist (for development only)
DROP TABLE IF EXISTS rental_income CASCADE;
DROP TABLE IF EXISTS installment_payments CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS rank_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ticket_replies CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS kyc_documents CASCADE;
DROP TABLE IF EXISTS payouts CASCADE;
DROP TABLE IF EXISTS property_investments CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================
-- USERS TABLE
-- ==============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    country VARCHAR(50) DEFAULT 'India',

    -- MLM Tree Structure
    sponsor_id VARCHAR(20),
    sponsor_user_id BIGINT REFERENCES users(id),
    placement VARCHAR(10), -- LEFT, RIGHT, AUTO
    placement_user_id BIGINT REFERENCES users(id),

    level INTEGER DEFAULT 0,
    left_bv DECIMAL(15,2) DEFAULT 0,
    right_bv DECIMAL(15,2) DEFAULT 0,
    carry_forward_left DECIMAL(15,2) DEFAULT 0,
    carry_forward_right DECIMAL(15,2) DEFAULT 0,
    personal_bv DECIMAL(15,2) DEFAULT 0,
    team_bv DECIMAL(15,2) DEFAULT 0,

    -- Financial Tracking
    total_investment DECIMAL(15,2) DEFAULT 0,
    total_earnings DECIMAL(15,2) DEFAULT 0,
    total_withdrawn DECIMAL(15,2) DEFAULT 0,

    -- Rank & Status
    rank VARCHAR(50) DEFAULT 'Associate',
    rank_achieved_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACTIVE, BLOCKED, INACTIVE
    role VARCHAR(20) DEFAULT 'MEMBER', -- ADMIN, MANAGER, MEMBER, FRANCHISE

    -- Verification
    email_verified BOOLEAN DEFAULT FALSE,
    mobile_verified BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, BASIC, FULL, PREMIUM, REJECTED
    kyc_level VARCHAR(20) DEFAULT 'NONE', -- BASIC, FULL, PREMIUM

    -- Activation & Login
    activation_date TIMESTAMP,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),

    referral_code VARCHAR(20) UNIQUE,
    profile_picture VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_sponsor ON users(sponsor_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_placement ON users(placement_user_id, placement);

-- ==============================================
-- WALLETS TABLE
-- ==============================================
CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    investment_balance DECIMAL(15,2) DEFAULT 0,
    commission_balance DECIMAL(15,2) DEFAULT 0,
    rental_income_balance DECIMAL(15,2) DEFAULT 0,
    roi_balance DECIMAL(15,2) DEFAULT 0,

    total_earned DECIMAL(15,2) DEFAULT 0,
    total_withdrawn DECIMAL(15,2) DEFAULT 0,
    total_invested DECIMAL(15,2) DEFAULT 0,
    locked_balance DECIMAL(15,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- ==============================================
-- PROPERTIES TABLE
-- ==============================================
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    property_id VARCHAR(50) UNIQUE NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL, -- RESIDENTIAL, COMMERCIAL, PLOT, VILLA, APARTMENT
    property_category VARCHAR(50), -- READY_TO_MOVE, UNDER_CONSTRUCTION, PRE_LAUNCH

    -- Location
    address TEXT,
    landmark VARCHAR(200),
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    country VARCHAR(50) DEFAULT 'India',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    google_maps_link TEXT,

    -- Specifications
    total_area DECIMAL(10,2),
    built_up_area DECIMAL(10,2),
    carpet_area DECIMAL(10,2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    floors INTEGER,
    total_floors INTEGER,
    property_age INTEGER,
    facing_direction VARCHAR(20),
    furnishing_status VARCHAR(30),
    amenities JSONB,

    -- Pricing
    base_price DECIMAL(15,2) NOT NULL,
    investment_price DECIMAL(15,2) NOT NULL,
    minimum_investment DECIMAL(15,2) NOT NULL,
    maximum_investment_per_user DECIMAL(15,2),
    total_investment_slots INTEGER,
    slots_booked INTEGER DEFAULT 0,
    current_booking_percentage DECIMAL(5,2) DEFAULT 0,

    -- Commission
    direct_referral_commission_percent DECIMAL(5,2) DEFAULT 2.0,
    bv_value DECIMAL(15,2) NOT NULL,
    level_commission_enabled BOOLEAN DEFAULT TRUE,
    binary_commission_enabled BOOLEAN DEFAULT TRUE,

    -- ROI
    expected_roi_percent DECIMAL(5,2),
    roi_tenure_months INTEGER,
    appreciation_rate_annual DECIMAL(5,2),
    rental_yield_percent DECIMAL(5,2),

    -- Developer
    developer_name VARCHAR(200),
    developer_rera_number VARCHAR(100),
    developer_contact VARCHAR(15),
    developer_email VARCHAR(100),

    -- Documents
    title_deed_url VARCHAR(255),
    rera_certificate_url VARCHAR(255),
    occupancy_certificate_url VARCHAR(255),
    noc_urls JSONB,
    property_tax_receipt_url VARCHAR(255),

    -- Media
    images JSONB,
    videos JSONB,
    virtual_tour_url VARCHAR(255),
    floor_plan_url VARCHAR(255),
    brochure_url VARCHAR(255),

    -- Status
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    launch_date DATE,
    booking_close_date DATE,
    expected_completion_date DATE,
    possession_date DATE,

    featured BOOLEAN DEFAULT FALSE,
    trending BOOLEAN DEFAULT FALSE,
    bestseller BOOLEAN DEFAULT FALSE,

    -- Stats
    total_investments_received DECIMAL(15,2) DEFAULT 0,
    total_investors_count INTEGER DEFAULT 0,
    current_market_value DECIMAL(15,2),
    last_valuation_date DATE,
    appreciation_history JSONB,

    nearby_facilities JSONB,

    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(investment_price);
CREATE INDEX idx_properties_featured ON properties(featured);

-- ==============================================
-- TRANSACTIONS TABLE
-- ==============================================
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),

    type VARCHAR(20) NOT NULL, -- CREDIT, DEBIT
    category VARCHAR(50) NOT NULL, -- COMMISSION, WITHDRAWAL, INVESTMENT, REFUND, RENTAL, ROI
    wallet_type VARCHAR(30),

    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),

    description TEXT,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),

    status VARCHAR(20) DEFAULT 'COMPLETED', -- PENDING, COMPLETED, FAILED, REVERSED
    payment_method VARCHAR(30),
    payment_gateway_ref VARCHAR(100),

    ip_address VARCHAR(50),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_reference ON transactions(reference_id, reference_type);
CREATE INDEX idx_transactions_date ON transactions(created_at);

-- ==============================================
-- COMMISSIONS TABLE
-- ==============================================
CREATE TABLE commissions (
    id BIGSERIAL PRIMARY KEY,
    commission_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    from_user_id BIGINT REFERENCES users(id),

    commission_type VARCHAR(50) NOT NULL,
    level INTEGER,

    amount DECIMAL(15,2) NOT NULL,
    percentage DECIMAL(5,2),
    base_amount DECIMAL(15,2),

    property_id BIGINT,
    investment_id BIGINT,
    business_volume DECIMAL(15,2),

    description TEXT,
    calculation_details JSONB,

    status VARCHAR(20) DEFAULT 'PENDING',
    cap_applied BOOLEAN DEFAULT FALSE,
    capped_amount DECIMAL(15,2),

    paid_at TIMESTAMP,
    transaction_id BIGINT REFERENCES transactions(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commissions_user ON commissions(user_id);
CREATE INDEX idx_commissions_from_user ON commissions(from_user_id);
CREATE INDEX idx_commissions_type ON commissions(commission_type);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_property ON commissions(property_id);
CREATE INDEX idx_commissions_date ON commissions(created_at);

-- ==============================================
-- PROPERTY INVESTMENTS TABLE
-- ==============================================
CREATE TABLE property_investments (
    id BIGSERIAL PRIMARY KEY,
    investment_id VARCHAR(50) UNIQUE NOT NULL,

    property_id BIGINT NOT NULL REFERENCES properties(id),
    user_id BIGINT NOT NULL REFERENCES users(id),

    investment_amount DECIMAL(15,2) NOT NULL,
    bv_allocated DECIMAL(15,2) NOT NULL,
    investment_type VARCHAR(30) NOT NULL,

    -- Installments
    installment_plan VARCHAR(30),
    total_installments INTEGER,
    installments_paid INTEGER DEFAULT 0,
    installment_amount DECIMAL(15,2),
    next_installment_date DATE,
    total_paid DECIMAL(15,2) DEFAULT 0,
    pending_amount DECIMAL(15,2),

    -- Payment
    payment_method VARCHAR(30),
    payment_gateway_ref VARCHAR(100),

    -- Commission
    commission_eligible BOOLEAN DEFAULT TRUE,
    commissions_paid DECIMAL(15,2) DEFAULT 0,
    commission_status VARCHAR(30) DEFAULT 'PENDING',

    -- Nominee
    nominee_name VARCHAR(100),
    nominee_relation VARCHAR(50),
    nominee_contact VARCHAR(15),
    nominee_dob DATE,

    -- Agreement
    agreement_number VARCHAR(100),
    agreement_date DATE,
    agreement_document_url VARCHAR(255),
    allotment_letter_url VARCHAR(255),

    -- Status
    investment_status VARCHAR(30) DEFAULT 'ACTIVE',
    booking_status VARCHAR(30) DEFAULT 'CONFIRMED',

    -- ROI
    expected_maturity_date DATE,
    current_value DECIMAL(15,2),
    roi_earned DECIMAL(15,2) DEFAULT 0,
    rental_income_earned DECIMAL(15,2) DEFAULT 0,

    -- Exit
    exit_requested BOOLEAN DEFAULT FALSE,
    exit_date DATE,
    exit_amount DECIMAL(15,2),
    capital_gains DECIMAL(15,2),

    lock_in_period_months INTEGER DEFAULT 12,
    lock_in_end_date DATE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investments_property ON property_investments(property_id);
CREATE INDEX idx_investments_user ON property_investments(user_id);
CREATE INDEX idx_investments_status ON property_investments(investment_status);
CREATE INDEX idx_investments_next_installment ON property_investments(next_installment_date);

-- ==============================================
-- INSTALLMENT PAYMENTS TABLE
-- ==============================================
CREATE TABLE installment_payments (
    id BIGSERIAL PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL,

    investment_id BIGINT NOT NULL REFERENCES property_investments(id),
    installment_number INTEGER NOT NULL,

    due_date DATE NOT NULL,
    paid_date TIMESTAMP,

    installment_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2),
    penalty_amount DECIMAL(15,2) DEFAULT 0,

    status VARCHAR(30) DEFAULT 'PENDING',
    payment_method VARCHAR(30),
    transaction_id BIGINT REFERENCES transactions(id),
    payment_gateway_ref VARCHAR(100),

    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_installments_investment ON installment_payments(investment_id);
CREATE INDEX idx_installments_due_date ON installment_payments(due_date);
CREATE INDEX idx_installments_status ON installment_payments(status);

-- ==============================================
-- PAYOUTS TABLE
-- ==============================================
CREATE TABLE payouts (
    id BIGSERIAL PRIMARY KEY,
    payout_id VARCHAR(50) UNIQUE NOT NULL,

    user_id BIGINT NOT NULL REFERENCES users(id),

    requested_amount DECIMAL(15,2) NOT NULL,
    tds_amount DECIMAL(15,2) NOT NULL,
    admin_charge DECIMAL(15,2) NOT NULL,
    net_amount DECIMAL(15,2) NOT NULL,

    -- Bank Details
    bank_name VARCHAR(100),
    account_number VARCHAR(30),
    ifsc_code VARCHAR(20),
    account_holder_name VARCHAR(100),
    branch_name VARCHAR(100),
    upi_id VARCHAR(100),

    payment_method VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'REQUESTED',

    remarks TEXT,
    rejection_reason TEXT,
    payment_proof_url VARCHAR(255),
    payment_gateway_ref VARCHAR(100),
    utr_number VARCHAR(100),

    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,

    approved_by BIGINT REFERENCES users(id),
    processed_by BIGINT REFERENCES users(id),
    transaction_id BIGINT REFERENCES transactions(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payouts_user ON payouts(user_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_date ON payouts(requested_at);

-- ==============================================
-- KYC DOCUMENTS TABLE
-- ==============================================
CREATE TABLE kyc_documents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),

    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    document_file_url VARCHAR(255) NOT NULL,
    document_front_url VARCHAR(255),
    document_back_url VARCHAR(255),

    status VARCHAR(30) DEFAULT 'PENDING',
    remarks TEXT,
    rejection_reason TEXT,

    verified_by BIGINT REFERENCES users(id),
    verified_at TIMESTAMP,
    expiry_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX idx_kyc_type ON kyc_documents(document_type);
CREATE INDEX idx_kyc_status ON kyc_documents(status);

-- ==============================================
-- BANK ACCOUNTS TABLE
-- ==============================================
CREATE TABLE bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),

    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(30) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    branch_name VARCHAR(100),
    account_type VARCHAR(20),
    upi_id VARCHAR(100),

    is_verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(30),
    verified_at TIMESTAMP,
    is_primary BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);

-- ==============================================
-- SUPPORT TICKETS TABLE
-- ==============================================
CREATE TABLE support_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,

    user_id BIGINT NOT NULL REFERENCES users(id),
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    attachments JSONB,

    status VARCHAR(30) DEFAULT 'OPEN',
    assigned_to BIGINT REFERENCES users(id),
    assigned_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_category ON support_tickets(category);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);

-- ==============================================
-- TICKET REPLIES TABLE
-- ==============================================
CREATE TABLE ticket_replies (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),

    message TEXT NOT NULL,
    attachments JSONB,
    is_admin BOOLEAN DEFAULT FALSE,
    is_internal BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_replies_ticket ON ticket_replies(ticket_id);

-- ==============================================
-- NOTIFICATIONS TABLE
-- ==============================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),

    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    link VARCHAR(255),

    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_broadcast BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_date ON notifications(created_at);

-- ==============================================
-- RENTAL INCOME TABLE
-- ==============================================
CREATE TABLE rental_income (
    id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL REFERENCES properties(id),
    investment_id BIGINT NOT NULL REFERENCES property_investments(id),
    user_id BIGINT NOT NULL REFERENCES users(id),

    month VARCHAR(7) NOT NULL,
    rental_amount DECIMAL(15,2) NOT NULL,
    investor_share_percent DECIMAL(5,2) NOT NULL,
    investor_share_amount DECIMAL(15,2) NOT NULL,

    maintenance_charges DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,

    status VARCHAR(30) DEFAULT 'PENDING',
    paid_at TIMESTAMP,
    transaction_id BIGINT REFERENCES transactions(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rental_property ON rental_income(property_id);
CREATE INDEX idx_rental_investment ON rental_income(investment_id);
CREATE INDEX idx_rental_user ON rental_income(user_id);
CREATE INDEX idx_rental_month ON rental_income(month);

-- ==============================================
-- RANK SETTINGS TABLE
-- ==============================================
CREATE TABLE rank_settings (
    id BIGSERIAL PRIMARY KEY,
    rank_name VARCHAR(50) UNIQUE NOT NULL,

    required_direct_referrals INTEGER NOT NULL,
    required_team_investment DECIMAL(15,2) NOT NULL,
    required_personal_investment DECIMAL(15,2),
    required_active_legs INTEGER,

    one_time_bonus DECIMAL(15,2) DEFAULT 0,
    monthly_leadership_bonus DECIMAL(15,2) DEFAULT 0,
    commission_boost_percent DECIMAL(5,2) DEFAULT 0,

    benefits JSONB,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default rank settings
INSERT INTO rank_settings (rank_name, required_direct_referrals, required_team_investment, one_time_bonus, display_order) VALUES
('Associate', 0, 0, 0, 1),
('Executive', 2, 100000, 0, 2),
('Manager', 5, 500000, 10000, 3),
('Senior Manager', 10, 2000000, 50000, 4),
('Director', 20, 10000000, 200000, 5),
('Vice President', 50, 50000000, 1000000, 6),
('President', 100, 200000000, 5000000, 7);

-- ==============================================
-- SYSTEM SETTINGS TABLE
-- ==============================================
CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    data_type VARCHAR(20) DEFAULT 'STRING',
    category VARCHAR(50),
    description TEXT,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES users(id)
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, data_type, category, description) VALUES
('min_withdrawal_amount', '1000', 'NUMBER', 'PAYOUT', 'Minimum withdrawal amount in INR'),
('max_daily_withdrawal', '100000', 'NUMBER', 'PAYOUT', 'Maximum daily withdrawal limit'),
('tds_percentage', '10', 'NUMBER', 'PAYOUT', 'TDS percentage on payouts'),
('admin_charge_percent', '2', 'NUMBER', 'PAYOUT', 'Admin processing fee percentage'),
('binary_pairing_bonus', '100', 'NUMBER', 'COMMISSION', 'Binary pairing bonus per 10000 BV'),
('binary_daily_cap', '25000', 'NUMBER', 'COMMISSION', 'Daily binary commission cap'),
('binary_weekly_cap', '150000', 'NUMBER', 'COMMISSION', 'Weekly binary commission cap'),
('min_investment_amount', '50000', 'NUMBER', 'INVESTMENT', 'Minimum property investment amount'),
('lock_in_period_months', '12', 'NUMBER', 'INVESTMENT', 'Investment lock-in period in months'),
('direct_referral_commission', '2', 'NUMBER', 'COMMISSION', 'Direct referral commission percentage'),
('level_commission_percentages', '[3,2,1.5,1,1,0.5,0.5,0.5,0.5,0.5]', 'JSON', 'COMMISSION', 'Level-wise commission percentages'),
('max_roi_cap_percent', '300', 'NUMBER', 'COMMISSION', 'Maximum ROI cap (% of investment)'),
('company_name', 'Real Estate MLM Platform', 'STRING', 'GENERAL', 'Company name'),
('support_email', 'support@example.com', 'STRING', 'GENERAL', 'Support email'),
('support_phone', '+91-1234567890', 'STRING', 'GENERAL', 'Support phone number');

-- ==============================================
-- AUDIT LOGS TABLE
-- ==============================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),

    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),

    old_values JSONB,
    new_values JSONB,

    ip_address VARCHAR(50),
    user_agent TEXT,
    status VARCHAR(30),
    error_message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_date ON audit_logs(created_at);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_investments_updated_at BEFORE UPDATE ON property_investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rank_settings_updated_at BEFORE UPDATE ON rank_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SAMPLE DATA (OPTIONAL - FOR DEVELOPMENT)
-- ==============================================

-- Create admin user (password: Admin@123)
INSERT INTO users (user_id, full_name, email, mobile, password, status, role, email_verified, mobile_verified, kyc_status, kyc_level)
VALUES ('MLM001', 'System Administrator', 'admin@mlmplatform.com', '9999999999', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5mYGLq1r7o.ZG', 'ACTIVE', 'ADMIN', TRUE, TRUE, 'PREMIUM', 'PREMIUM');

-- Create wallet for admin
INSERT INTO wallets (user_id, commission_balance, total_earned)
VALUES (1, 0, 0);

COMMIT;
