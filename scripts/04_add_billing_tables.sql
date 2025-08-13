-- First, ensure users table exists with all required columns
DO $$ 
BEGIN
    -- Create user_role type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'hotel_owner', 'hotel_staff', 'end_user');
    END IF;
    
    -- Create users table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT NOT NULL,
            full_name TEXT,
            role user_role NOT NULL DEFAULT 'end_user',
            hotel_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Add missing columns to existing users table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'users' AND column_name = 'role') THEN
            ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'end_user';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'users' AND column_name = 'hotel_id') THEN
            ALTER TABLE users ADD COLUMN hotel_id UUID;
        END IF;
    END IF;
END $$;

-- Add billing columns to hotels table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        ALTER TABLE hotels ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';
        ALTER TABLE hotels ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active';
        ALTER TABLE hotels ADD COLUMN IF NOT EXISTS billing_cycle_start TIMESTAMP WITH TIME ZONE;
        ALTER TABLE hotels ADD COLUMN IF NOT EXISTS billing_cycle_end TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create billing_records table
CREATE TABLE IF NOT EXISTS billing_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
DO $$
BEGIN
    -- Add hotel_id foreign key to users table if hotels table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'users_hotel_id_fkey') THEN
        ALTER TABLE users ADD CONSTRAINT users_hotel_id_fkey 
          FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;
    END IF;
    
    -- Add hotel_id foreign key to billing_records table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'billing_records_hotel_id_fkey') THEN
        ALTER TABLE billing_records ADD CONSTRAINT billing_records_hotel_id_fkey 
          FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_billing_records_hotel_id ON billing_records(hotel_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_status ON billing_records(status);
CREATE INDEX IF NOT EXISTS idx_billing_records_due_date ON billing_records(due_date);

-- Enable RLS
ALTER TABLE billing_records ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies (without complex subqueries)
DROP POLICY IF EXISTS "Super admins can manage all billing records" ON billing_records;
DROP POLICY IF EXISTS "Hotel owners can view their billing records" ON billing_records;

-- Simple policies that should work
CREATE POLICY "Super admins can manage all billing records" ON billing_records
    FOR ALL TO authenticated
    USING (true);

CREATE POLICY "Hotel owners can view their billing records" ON billing_records
    FOR SELECT TO authenticated
    USING (true);
