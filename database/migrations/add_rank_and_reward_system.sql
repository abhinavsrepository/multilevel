-- ==============================================
-- RANK AND REWARD SYSTEM MIGRATION
-- Adds new rank tiers with rewards according to requirements
-- ==============================================

-- Clear existing default ranks (if needed for fresh setup)
-- TRUNCATE TABLE rank_settings CASCADE;

-- Delete existing default ranks to replace with new structure
DELETE FROM rank_settings;

-- Insert new rank tiers with rewards
INSERT INTO rank_settings (
    rank_name,
    required_direct_referrals,
    required_team_investment,
    required_personal_investment,
    one_time_bonus,
    monthly_leadership_bonus,
    commission_boost_percent,
    benefits,
    display_order,
    is_active
) VALUES
-- Team Leader: 15 lacs team investment, 15k monthly reward
(
    'Team Leader',
    5,
    1500000.00,  -- 15 lacs
    100000.00,   -- minimum personal investment
    0,           -- no one-time bonus specified
    15000.00,    -- 15k monthly reward
    5.00,        -- 5% commission boost
    '["Access to team leader dashboard", "Team management tools", "Monthly incentive bonus"]'::jsonb,
    1,
    true
),

-- Regional Head: 50 lacs team investment, 50k-60k monthly reward
(
    'Regional Head',
    10,
    5000000.00,  -- 50 lacs
    300000.00,   -- minimum personal investment
    0,           -- no one-time bonus specified
    55000.00,    -- 55k monthly reward (average of 50-60k)
    10.00,       -- 10% commission boost
    '["Regional dashboard access", "Lead regional meetings", "Higher commission rates", "Travel incentives"]'::jsonb,
    2,
    true
),

-- Zonal Head: 1.5 cr team investment, 1.5-2 lacs monthly reward
(
    'Zonal Head',
    20,
    15000000.00, -- 1.5 crore
    500000.00,   -- minimum personal investment
    0,           -- no one-time bonus specified
    175000.00,   -- 1.75 lacs monthly reward (average of 1.5-2 lacs)
    15.00,       -- 15% commission boost
    '["Zonal authority", "Strategy planning rights", "Premium support", "Zone expansion incentives", "Conference attendance"]'::jsonb,
    3,
    true
),

-- General Manager: 5 cr team investment, 6 lacs monthly reward
(
    'General Manager',
    50,
    50000000.00, -- 5 crore
    1000000.00,  -- minimum personal investment
    1000000.00,  -- 10 lacs one-time achievement bonus
    600000.00,   -- 6 lacs monthly reward
    20.00,       -- 20% commission boost
    '["General management authority", "Strategic decision making", "International trips", "Luxury car fund", "Premium healthcare benefits"]'::jsonb,
    4,
    true
),

-- Vice President (VP): 15 cr team investment, 15-18 lacs monthly reward
(
    'Vice President',
    100,
    150000000.00, -- 15 crore
    3000000.00,   -- minimum personal investment
    3000000.00,   -- 30 lacs one-time achievement bonus
    1650000.00,   -- 16.5 lacs monthly reward (average of 15-18 lacs)
    25.00,        -- 25% commission boost
    '["VP level authority", "Company policy influence", "Luxury travel benefits", "House fund assistance", "Equity participation options", "Executive coaching"]'::jsonb,
    5,
    true
),

-- President: 40 cr team investment, 40-45 lacs monthly reward
(
    'President',
    200,
    400000000.00, -- 40 crore
    10000000.00,  -- minimum personal investment (1 crore)
    10000000.00,  -- 1 crore one-time achievement bonus
    4250000.00,   -- 42.5 lacs monthly reward (average of 40-45 lacs)
    30.00,        -- 30% commission boost
    '["Presidential privileges", "Board level participation", "Global business expansion rights", "Luxury villa/apartment", "Private jet access", "Legacy building programs", "Lifetime passive income"]'::jsonb,
    6,
    true
),

-- EG Brand Ambassador: 100 cr team investment, 1 cr monthly reward
(
    'EG Brand Ambassador',
    500,
    1000000000.00, -- 100 crore
    50000000.00,   -- minimum personal investment (5 crore)
    50000000.00,   -- 5 crore one-time achievement bonus
    10000000.00,   -- 1 crore monthly reward
    50.00,         -- 50% commission boost
    '["Brand ambassador status", "Company ownership stake", "Global brand rights", "Lifetime royalty income", "International property ownership", "Private island retreat access", "Family legacy trust fund", "Philanthropic foundation support"]'::jsonb,
    7,
    true
);

-- ==============================================
-- REWARD DISTRIBUTION TABLE
-- Tracks monthly reward payouts for each rank
-- ==============================================
CREATE TABLE IF NOT EXISTS rank_rewards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank_id BIGINT NOT NULL REFERENCES rank_settings(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL, -- 'MONTHLY_LEADERSHIP', 'ONE_TIME_BONUS', 'COMMISSION_BOOST'
    reward_amount DECIMAL(15,2) NOT NULL,
    period_month INTEGER, -- Month number (1-12)
    period_year INTEGER,  -- Year (e.g., 2025)
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSED', 'PAID', 'FAILED'
    processed_at TIMESTAMP,
    paid_at TIMESTAMP,
    transaction_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_rank_rewards_user_id ON rank_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rank_rewards_rank_id ON rank_rewards(rank_id);
CREATE INDEX IF NOT EXISTS idx_rank_rewards_status ON rank_rewards(status);
CREATE INDEX IF NOT EXISTS idx_rank_rewards_period ON rank_rewards(period_year, period_month);

-- ==============================================
-- RANK ACHIEVEMENT HISTORY TABLE
-- Tracks when users achieve each rank
-- ==============================================
CREATE TABLE IF NOT EXISTS rank_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank_id BIGINT NOT NULL REFERENCES rank_settings(id) ON DELETE CASCADE,
    rank_name VARCHAR(50) NOT NULL,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Qualification metrics at time of achievement
    direct_referrals_count INTEGER,
    team_investment_amount DECIMAL(15,2),
    personal_investment_amount DECIMAL(15,2),

    -- Rewards given
    one_time_bonus_given DECIMAL(15,2) DEFAULT 0,
    bonus_paid BOOLEAN DEFAULT FALSE,
    bonus_paid_at TIMESTAMP,

    -- Manual or automatic
    manual_assignment BOOLEAN DEFAULT FALSE,
    assigned_by BIGINT REFERENCES users(id),

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rank_achievements_user_id ON rank_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_rank_achievements_rank_id ON rank_achievements(rank_id);
CREATE INDEX IF NOT EXISTS idx_rank_achievements_achieved_at ON rank_achievements(achieved_at);

-- ==============================================
-- UPDATE USER_RANKS TABLE (if it doesn't have required fields)
-- ==============================================
ALTER TABLE user_ranks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE user_ranks ADD COLUMN IF NOT EXISTS one_time_bonus_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE user_ranks ADD COLUMN IF NOT EXISTS bonus_paid_at TIMESTAMP;

-- ==============================================
-- FUNCTION TO AUTOMATICALLY DISTRIBUTE MONTHLY REWARDS
-- Called by a cron job or scheduled task
-- ==============================================
CREATE OR REPLACE FUNCTION distribute_monthly_rank_rewards()
RETURNS void AS $$
DECLARE
    current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    user_record RECORD;
BEGIN
    -- Find all users with current ranks that have monthly bonuses
    FOR user_record IN
        SELECT
            ur.user_id,
            ur.rank_id,
            rs.rank_name,
            rs.monthly_leadership_bonus
        FROM user_ranks ur
        INNER JOIN rank_settings rs ON ur.rank_id = rs.id
        WHERE ur.is_current = TRUE
          AND rs.monthly_leadership_bonus > 0
          AND rs.is_active = TRUE
          -- Check if reward not already created for this month
          AND NOT EXISTS (
              SELECT 1 FROM rank_rewards rr
              WHERE rr.user_id = ur.user_id
                AND rr.rank_id = ur.rank_id
                AND rr.period_month = current_month
                AND rr.period_year = current_year
                AND rr.reward_type = 'MONTHLY_LEADERSHIP'
          )
    LOOP
        -- Create reward record
        INSERT INTO rank_rewards (
            user_id,
            rank_id,
            reward_type,
            reward_amount,
            period_month,
            period_year,
            status,
            notes
        ) VALUES (
            user_record.user_id,
            user_record.rank_id,
            'MONTHLY_LEADERSHIP',
            user_record.monthly_leadership_bonus,
            current_month,
            current_year,
            'PENDING',
            'Monthly leadership bonus for ' || user_record.rank_name
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================
COMMENT ON TABLE rank_settings IS 'Defines all rank tiers with requirements and rewards';
COMMENT ON TABLE rank_rewards IS 'Tracks monthly and one-time reward distributions for rank holders';
COMMENT ON TABLE rank_achievements IS 'Historical record of when users achieved each rank';
COMMENT ON COLUMN rank_settings.required_team_investment IS 'Total team investment required in INR';
COMMENT ON COLUMN rank_settings.one_time_bonus IS 'One-time achievement bonus when rank is first achieved';
COMMENT ON COLUMN rank_settings.monthly_leadership_bonus IS 'Monthly recurring reward for holding this rank';
COMMENT ON COLUMN rank_settings.commission_boost_percent IS 'Additional percentage boost to all commissions';
