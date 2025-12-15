-- Migration: Add OAuth and Paystack fields to users table
-- Date: 2024-12-16
-- Description: Add google_id, paystack_customer_code, and paystack_subscription_code fields

-- Add Google OAuth ID field (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='google_id'
    ) THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
        RAISE NOTICE 'Added column google_id';
    ELSE
        RAISE NOTICE 'Column google_id already exists, skipping';
    END IF;
END $$;

-- Add Paystack customer code field (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='paystack_customer_code'
    ) THEN
        ALTER TABLE users ADD COLUMN paystack_customer_code VARCHAR(255) UNIQUE;
        RAISE NOTICE 'Added column paystack_customer_code';
    ELSE
        RAISE NOTICE 'Column paystack_customer_code already exists, skipping';
    END IF;
END $$;

-- Add Paystack subscription code field (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='paystack_subscription_code'
    ) THEN
        ALTER TABLE users ADD COLUMN paystack_subscription_code VARCHAR(255) UNIQUE;
        RAISE NOTICE 'Added column paystack_subscription_code';
    ELSE
        RAISE NOTICE 'Column paystack_subscription_code already exists, skipping';
    END IF;
END $$;

-- Verify migration
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('google_id', 'paystack_customer_code', 'paystack_subscription_code')
ORDER BY column_name;
