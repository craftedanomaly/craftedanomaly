-- Fix admin_users table structure
-- Run this in Supabase SQL Editor

-- First check current table structure
\d admin_users;

-- Add missing columns if they don't exist
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'editor';

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create unique constraint on email if not exists
ALTER TABLE admin_users 
ADD CONSTRAINT IF NOT EXISTS admin_users_email_unique UNIQUE (email);

-- Create unique constraint on auth_user_id if not exists
ALTER TABLE admin_users 
ADD CONSTRAINT IF NOT EXISTS admin_users_auth_user_id_unique UNIQUE (auth_user_id);

-- Check final structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
ORDER BY ordinal_position;
