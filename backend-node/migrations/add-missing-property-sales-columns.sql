-- Add missing columns to property_sales table
-- This migration safely adds any missing columns

-- Create ENUM types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_property_sales_sale_status') THEN
        CREATE TYPE enum_property_sales_sale_status AS ENUM (
            'PENDING',
            'APPROVED',
            'REJECTED',
            'CANCELLED',
            'COMPLETED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_property_sales_sale_type') THEN
        CREATE TYPE enum_property_sales_sale_type AS ENUM (
            'PRIMARY_BOOKING',
            'FULL_PAYMENT'
        );
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- sale_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='sale_type') THEN
        ALTER TABLE property_sales ADD COLUMN sale_type enum_property_sales_sale_type DEFAULT 'FULL_PAYMENT';
        RAISE NOTICE 'Added column: sale_type';
    END IF;

    -- plot_size column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='plot_size') THEN
        ALTER TABLE property_sales ADD COLUMN plot_size DECIMAL(10, 2);
        RAISE NOTICE 'Added column: plot_size';
    END IF;

    -- price_per_sq_ft column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='price_per_sq_ft') THEN
        ALTER TABLE property_sales ADD COLUMN price_per_sq_ft DECIMAL(10, 2);
        RAISE NOTICE 'Added column: price_per_sq_ft';
    END IF;

    -- is_self_code column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='is_self_code') THEN
        ALTER TABLE property_sales ADD COLUMN is_self_code BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: is_self_code';
    END IF;

    -- projected_direct_incentive column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='projected_direct_incentive') THEN
        ALTER TABLE property_sales ADD COLUMN projected_direct_incentive DECIMAL(15, 2);
        RAISE NOTICE 'Added column: projected_direct_incentive';
    END IF;

    -- projected_tsb column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='projected_tsb') THEN
        ALTER TABLE property_sales ADD COLUMN projected_tsb DECIMAL(15, 2);
        RAISE NOTICE 'Added column: projected_tsb';
    END IF;

    -- actual_direct_incentive column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='actual_direct_incentive') THEN
        ALTER TABLE property_sales ADD COLUMN actual_direct_incentive DECIMAL(15, 2);
        RAISE NOTICE 'Added column: actual_direct_incentive';
    END IF;

    -- actual_tsb column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='actual_tsb') THEN
        ALTER TABLE property_sales ADD COLUMN actual_tsb DECIMAL(15, 2);
        RAISE NOTICE 'Added column: actual_tsb';
    END IF;

    -- distribution_month column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='distribution_month') THEN
        ALTER TABLE property_sales ADD COLUMN distribution_month VARCHAR(7);
        RAISE NOTICE 'Added column: distribution_month';
    END IF;

    -- is_distributed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='is_distributed') THEN
        ALTER TABLE property_sales ADD COLUMN is_distributed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: is_distributed';
    END IF;

    -- distributed_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='property_sales' AND column_name='distributed_at') THEN
        ALTER TABLE property_sales ADD COLUMN distributed_at TIMESTAMP;
        RAISE NOTICE 'Added column: distributed_at';
    END IF;

    RAISE NOTICE '✓ All required columns added successfully!';
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_property_sales_sale_type ON property_sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_property_sales_is_self_code ON property_sales(is_self_code);
CREATE INDEX IF NOT EXISTS idx_property_sales_distribution_month ON property_sales(distribution_month);
CREATE INDEX IF NOT EXISTS idx_property_sales_is_distributed ON property_sales(is_distributed);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE '✓ Migration completed successfully!';
    RAISE NOTICE '✓ property_sales table is ready with all columns';
    RAISE NOTICE '==================================================';
END $$;
