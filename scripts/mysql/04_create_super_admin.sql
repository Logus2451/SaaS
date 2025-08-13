-- Create Super Admin User for Hotel Booking SaaS Platform
-- 
-- IMPORTANT: Before running this script, you need to:
-- 1. Replace 'your-email@domain.com' with your actual email
-- 2. Replace 'your-secure-password' with your actual password
-- 3. The password will be hashed by the application, not stored in plain text
--
-- This script creates the initial super admin user for the platform

-- Method 1: Direct insertion (you'll need to hash the password first)
-- Replace the values below with your actual information

SET @admin_email = 'admin@yourplatform.com';
SET @admin_name = 'Platform Administrator';
-- Note: You'll need to generate the password hash using your application's auth system

-- Check if super admin already exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Super admin user already exists'
    ELSE 'No super admin user found - you need to create one'
  END as status
FROM users 
WHERE email = @admin_email AND role = 'super_admin';

-- To create the super admin user, you have two options:

-- Option 1: Use the application's signup API
-- Make a POST request to /api/auth/signup with:
-- {
--   "email": "admin@yourplatform.com",
--   "password": "your-secure-password",
--   "fullName": "Platform Administrator",
--   "role": "hotel_owner"
-- }
-- Then manually update the role to 'super_admin' in the database

-- Option 2: Direct database insertion (after hashing password in your app)
-- INSERT INTO users (email, password_hash, full_name, role, email_verified)
-- VALUES (@admin_email, 'HASHED_PASSWORD_HERE', @admin_name, 'super_admin', TRUE);

-- Instructions for setup:
-- 1. Run your application
-- 2. Use the signup form to create an account with your admin email
-- 3. Run this query to upgrade the user to super admin:

-- UPDATE users 
-- SET role = 'super_admin', email_verified = TRUE 
-- WHERE email = 'admin@yourplatform.com';

-- Verify super admin creation
-- SELECT id, email, full_name, role, email_verified, created_at 
-- FROM users 
-- WHERE role = 'super_admin';
