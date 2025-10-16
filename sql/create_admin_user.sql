-- Create admin user for ozgurcanuzunyasa@gmail.com
-- Run this AFTER fixing the table structure with fix_admin_users_table.sql

-- Step 1: Check if the user exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'ozgurcanuzunyasa@gmail.com';

-- Step 2: Check current admin_users table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'admin_users' ORDER BY ordinal_position;

-- Step 3: Insert admin user record
INSERT INTO admin_users (
  auth_user_id,
  email,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'ozgurcanuzunyasa@gmail.com'),
  'ozgurcanuzunyasa@gmail.com',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  auth_user_id = (SELECT id FROM auth.users WHERE email = 'ozgurcanuzunyasa@gmail.com'),
  is_active = true,
  role = 'admin',
  updated_at = NOW();

-- Step 4: Verify the insert
SELECT * FROM admin_users WHERE email = 'ozgurcanuzunyasa@gmail.com';
