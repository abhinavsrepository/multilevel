-- Migration: Add Proclaim Sale Enhancement Fields to property_sales table
-- Date: 2024-01-01
-- Description: Adds new fields to support the Proclaim Sale module including
--              sale type, plot details, projections, and distribution tracking

-- Add new columns to property_sales table
ALTER TABLE property_sales
ADD COLUMN IF NOT EXISTS sale_type VARCHAR(50) DEFAULT 'FULL_PAYMENT' CHECK (sale_type IN ('PRIMARY_BOOKING', 'FULL_PAYMENT')),
ADD COLUMN IF NOT EXISTS plot_size DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price_per_sq_ft DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS is_self_code BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS projected_direct_incentive DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS projected_tsb DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS actual_direct_incentive DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS actual_tsb DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS distribution_month VARCHAR(7),
ADD COLUMN IF NOT EXISTS is_distributed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMP;

-- Add comments to new columns
COMMENT ON COLUMN property_sales.sale_type IS 'Type of sale: PRIMARY_BOOKING (25% down) or FULL_PAYMENT';
COMMENT ON COLUMN property_sales.plot_size IS 'Plot size in square feet';
COMMENT ON COLUMN property_sales.price_per_sq_ft IS 'Price per square foot (₹550-₹1499 range)';
COMMENT ON COLUMN property_sales.is_self_code IS 'Whether this is a self-code sale (Associate = Buyer)';
COMMENT ON COLUMN property_sales.projected_direct_incentive IS 'Pre-calculated 5% direct incentive (for UI display)';
COMMENT ON COLUMN property_sales.projected_tsb IS 'Pre-calculated Team Sales Bonus amount (for UI display)';
COMMENT ON COLUMN property_sales.actual_direct_incentive IS 'Actual direct incentive paid after commission activation';
COMMENT ON COLUMN property_sales.actual_tsb IS 'Actual TSB distributed after commission activation';
COMMENT ON COLUMN property_sales.distribution_month IS 'Month of distribution (YYYY-MM format) for monthly payout tracking';
COMMENT ON COLUMN property_sales.is_distributed IS 'Whether commission has been distributed for this sale';
COMMENT ON COLUMN property_sales.distributed_at IS 'When commission was distributed';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_property_sales_sale_type ON property_sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_property_sales_is_self_code ON property_sales(is_self_code);
CREATE INDEX IF NOT EXISTS idx_property_sales_distribution_month ON property_sales(distribution_month);
CREATE INDEX IF NOT EXISTS idx_property_sales_is_distributed ON property_sales(is_distributed);

-- Update existing records with default values
UPDATE property_sales
SET sale_type = 'FULL_PAYMENT',
    is_self_code = FALSE,
    is_distributed = FALSE
WHERE sale_type IS NULL;

-- Success message
SELECT 'Migration completed successfully: Proclaim Sale fields added to property_sales table' AS status;
