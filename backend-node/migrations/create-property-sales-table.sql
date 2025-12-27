-- Create Property Sales Table
-- This migration creates the property_sales table for the Proclaim Sale feature
-- Safe to run multiple times (will skip if table already exists)

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

-- Create property_sales table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_sales (
    id BIGSERIAL PRIMARY KEY,
    sale_id VARCHAR(50) UNIQUE NOT NULL,
    property_id BIGINT NOT NULL,
    buyer_user_id BIGINT NOT NULL,
    employee_user_id BIGINT NOT NULL,
    sale_amount DECIMAL(15, 2) NOT NULL,
    down_payment DECIMAL(15, 2),
    installment_plan VARCHAR(50),
    total_installments INTEGER,
    installment_amount DECIMAL(15, 2),
    sale_date TIMESTAMP NOT NULL DEFAULT NOW(),
    sale_status enum_property_sales_sale_status NOT NULL DEFAULT 'PENDING',
    commission_eligible BOOLEAN DEFAULT FALSE,
    commission_activated BOOLEAN DEFAULT FALSE,
    commission_activated_at TIMESTAMP,
    commission_activated_by BIGINT,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    rejected_by BIGINT,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    buyer_details JSONB,
    sale_documents JSONB,
    payment_details JSONB,
    remarks TEXT,
    admin_remarks TEXT,
    sale_type enum_property_sales_sale_type DEFAULT 'FULL_PAYMENT',
    plot_size DECIMAL(10, 2),
    price_per_sq_ft DECIMAL(10, 2),
    is_self_code BOOLEAN DEFAULT FALSE,
    projected_direct_incentive DECIMAL(15, 2),
    projected_tsb DECIMAL(15, 2),
    actual_direct_incentive DECIMAL(15, 2),
    actual_tsb DECIMAL(15, 2),
    distribution_month VARCHAR(7),
    is_distributed BOOLEAN DEFAULT FALSE,
    distributed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_sales_sale_id ON property_sales(sale_id);
CREATE INDEX IF NOT EXISTS idx_property_sales_property_id ON property_sales(property_id);
CREATE INDEX IF NOT EXISTS idx_property_sales_buyer_user_id ON property_sales(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_property_sales_employee_user_id ON property_sales(employee_user_id);
CREATE INDEX IF NOT EXISTS idx_property_sales_sale_status ON property_sales(sale_status);
CREATE INDEX IF NOT EXISTS idx_property_sales_commission_eligible ON property_sales(commission_eligible);
CREATE INDEX IF NOT EXISTS idx_property_sales_commission_activated ON property_sales(commission_activated);
CREATE INDEX IF NOT EXISTS idx_property_sales_sale_date ON property_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_property_sales_created_at ON property_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_property_sales_sale_type ON property_sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_property_sales_is_self_code ON property_sales(is_self_code);
CREATE INDEX IF NOT EXISTS idx_property_sales_distribution_month ON property_sales(distribution_month);
CREATE INDEX IF NOT EXISTS idx_property_sales_is_distributed ON property_sales(is_distributed);

-- Add foreign key constraints (if the referenced tables exist)
DO $$
BEGIN
    -- Check if properties table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        -- Add foreign key if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_property_sales_property'
        ) THEN
            ALTER TABLE property_sales
            ADD CONSTRAINT fk_property_sales_property
            FOREIGN KEY (property_id) REFERENCES properties(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;

    -- Check if users table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Add foreign keys if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_property_sales_buyer'
        ) THEN
            ALTER TABLE property_sales
            ADD CONSTRAINT fk_property_sales_buyer
            FOREIGN KEY (buyer_user_id) REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_property_sales_employee'
        ) THEN
            ALTER TABLE property_sales
            ADD CONSTRAINT fk_property_sales_employee
            FOREIGN KEY (employee_user_id) REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_property_sales_approver'
        ) THEN
            ALTER TABLE property_sales
            ADD CONSTRAINT fk_property_sales_approver
            FOREIGN KEY (approved_by) REFERENCES users(id)
            ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_property_sales_rejector'
        ) THEN
            ALTER TABLE property_sales
            ADD CONSTRAINT fk_property_sales_rejector
            FOREIGN KEY (rejected_by) REFERENCES users(id)
            ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_property_sales_commission_activator'
        ) THEN
            ALTER TABLE property_sales
            ADD CONSTRAINT fk_property_sales_commission_activator
            FOREIGN KEY (commission_activated_by) REFERENCES users(id)
            ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'property_sales table created successfully!';
END $$;
