-- Ensure users table has all required columns before creating policies
-- Run this after script 1 and before script 4

-- Create user_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'hotel_owner', 'hotel_staff', 'end_user');
    END IF;
END $$;

-- Ensure users table exists with all required columns
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'end_user',
    hotel_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role user_role NOT NULL DEFAULT 'end_user';
    END IF;
END $$;

-- Add hotel_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'hotel_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN hotel_id UUID;
    END IF;
END $$;

-- Add foreign key constraint for hotel_id if it doesn't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels' AND table_schema = 'public')
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_hotel_id_fkey'
        AND table_name = 'users'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_hotel_id_fkey 
        FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
