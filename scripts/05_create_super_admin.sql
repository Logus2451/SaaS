-- Create super admin user for the SaaS platform owner
-- IMPORTANT: You must create the auth user first through Supabase Dashboard

-- Step 1: Ensure the users table has the correct structure
DO $$
BEGIN
    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'hotel_owner', 'hotel_staff', 'end_user');
    END IF;

    -- Ensure users table exists with correct structure
    CREATE TABLE IF NOT EXISTS public.users (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL,
        full_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD COLUMN role user_role NOT NULL DEFAULT 'end_user';
    END IF;

    -- Add hotel_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'hotel_id' AND table_schema = 'public') THEN
        ALTER TABLE public.users ADD COLUMN hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL;
    END IF;

    -- Enable RLS if not already enabled
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
END $$;

-- Step 2: Instructions for creating super admin
-- 
-- BEFORE RUNNING THE NEXT PART:
-- 1. Go to your Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" 
-- 3. Create user with:
--    - Email: your-email@domain.com
--    - Password: YourSecurePassword123!
--    - Email Confirm: true
-- 4. Copy the User ID (UUID) from the dashboard
-- 5. Replace 'YOUR_AUTH_USER_ID_HERE' below with the actual UUID
-- 6. Replace 'admin@yourplatform.com' with your actual email
-- 7. Then run this script

-- Step 3: Create/Update the super admin profile
DO $$
DECLARE
    user_uuid UUID := '8fc2424b-712e-44b2-96b5-b088ed24f716'::UUID;  -- Replace with actual UUID from Supabase Dashboard
    user_email TEXT := 'harivigneshjeeva95@gmail.com';        -- Replace with your actual email
BEGIN
    -- Added validation to ensure placeholders are replaced
    -- Validate that placeholders have been replaced
    --IF user_uuid::TEXT = '8fc2424b-712e-44b2-96b5-b088ed24f716' THEN
      --  RAISE EXCEPTION 'Invalid UUID format. Please replace YOUR_AUTH_USER_ID_HERE with the actual UUID from Supabase Dashboard.';
    --END IF;
    
    --IF user_email = 'harivigneshjeeva95@gmail.com' THEN
      --  RAISE EXCEPTION 'Please replace admin@yourplatform.com with your actual email address.';
    --END IF;

    -- Create/update the super admin profile
    INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        user_email,
        'Platform Administrator',
        'super_admin',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        full_name = 'Platform Administrator',
        updated_at = NOW();
    
    RAISE NOTICE 'Super admin profile created/updated successfully';
    RAISE NOTICE 'You can now login at /auth/login with %', user_email;
    
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Auth user not found. Please create the user in Supabase Dashboard first, then replace YOUR_AUTH_USER_ID_HERE with the actual UUID.';
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid UUID format. Please replace YOUR_AUTH_USER_ID_HERE with the actual UUID from Supabase Dashboard.';
END $$;

-- Verify the super admin was created (optional)
-- SELECT u.id, u.email, u.full_name, u.role, u.created_at 
-- FROM users u
-- WHERE u.role = 'super_admin';
