-- Fix admin_users RLS policies to allow service role access
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can read own profile" ON admin_users;

-- Allow service role to read admin_users for authentication checks
CREATE POLICY "Service role can read admin users" ON admin_users
  FOR SELECT USING (
    current_setting('role') = 'service_role' OR
    auth.uid() = auth_user_id
  );

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile" ON admin_users
  FOR SELECT USING (auth_user_id = auth.uid());

-- Only super admins can manage admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role = 'admin'
    )
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admin_users';
