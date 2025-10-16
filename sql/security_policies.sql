-- =====================================================
-- CRAFTED ANOMALY - SECURITY POLICIES
-- Row Level Security (RLS) Setup
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC READ POLICIES (Anonymous users)
-- =====================================================

-- Categories: Public can read all active categories
CREATE POLICY "Public can read active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Projects: Public can read only published projects
CREATE POLICY "Public can read published projects" ON projects
  FOR SELECT USING (status = 'published');

-- Media: Public can read media for published projects
CREATE POLICY "Public can read published media" ON media
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE status = 'published'
    )
  );

-- Tags: Public can read all tags
CREATE POLICY "Public can read tags" ON tags
  FOR SELECT USING (true);

-- Project Tags: Public can read tags for published projects
CREATE POLICY "Public can read published project tags" ON project_tags
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE status = 'published'
    )
  );

-- Hero Slides: Public can read active slides
CREATE POLICY "Public can read active hero slides" ON hero_slides
  FOR SELECT USING (is_active = true);

-- Site Settings: Public can read non-sensitive settings
CREATE POLICY "Public can read site settings" ON site_settings
  FOR SELECT USING (
    setting_key NOT IN (
      'admin_email', 'smtp_password', 'api_keys', 
      'secret_keys', 'private_settings'
    )
  );

-- =====================================================
-- ADMIN POLICIES (Authenticated admin users)
-- =====================================================

-- Categories: Admins can do everything
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role IN ('admin', 'editor')
    )
  );

-- Projects: Admins can do everything
CREATE POLICY "Admins can manage projects" ON projects
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role IN ('admin', 'editor')
    )
  );

-- Media: Admins can do everything
CREATE POLICY "Admins can manage media" ON media
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role IN ('admin', 'editor')
    )
  );

-- Tags: Admins can do everything
CREATE POLICY "Admins can manage tags" ON tags
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role IN ('admin', 'editor')
    )
  );

-- Project Tags: Admins can do everything
CREATE POLICY "Admins can manage project tags" ON project_tags
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role IN ('admin', 'editor')
    )
  );

-- Hero Slides: Admins can do everything
CREATE POLICY "Admins can manage hero slides" ON hero_slides
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role IN ('admin', 'editor')
    )
  );

-- Contact Messages: Admins can read and update
CREATE POLICY "Admins can manage contact messages" ON contact_messages
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role IN ('admin', 'editor')
    )
  );

-- Site Settings: Only super admins can manage sensitive settings
CREATE POLICY "Super admins can manage all settings" ON site_settings
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role = 'admin'
    )
  );

-- Editors can manage non-sensitive settings
CREATE POLICY "Editors can manage basic settings" ON site_settings
  FOR SELECT, UPDATE USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role = 'editor'
    ) AND setting_key NOT IN (
      'admin_email', 'smtp_password', 'api_keys', 
      'secret_keys', 'private_settings'
    )
  );

-- Admin Users: Only super admins can manage admin users
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true AND role = 'admin'
    )
  );

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON admin_users
  FOR SELECT USING (auth_user_id = auth.uid());

-- =====================================================
-- CONTACT FORM POLICY (Anonymous insert only)
-- =====================================================

-- Allow anonymous users to insert contact messages
CREATE POLICY "Anonymous can submit contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Media bucket: Public read access
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Project images bucket: Public read access
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for media bucket
CREATE POLICY "Public can view media files" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true
    )
  );

CREATE POLICY "Authenticated users can update media files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' AND
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true
    )
  );

CREATE POLICY "Authenticated users can delete media files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true
    )
  );

-- Storage policies for project-images bucket
CREATE POLICY "Public can view project images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-images' AND
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true
    )
  );

CREATE POLICY "Authenticated users can update project images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-images' AND
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true
    )
  );

CREATE POLICY "Authenticated users can delete project images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-images' AND
    auth.uid() IN (
      SELECT auth_user_id FROM admin_users 
      WHERE is_active = true
    )
  );

-- =====================================================
-- ADDITIONAL SECURITY MEASURES
-- =====================================================

-- Create function to check admin status
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_user_id = auth.uid() 
    AND is_active = true 
    AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check super admin status
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_user_id = auth.uid() 
    AND is_active = true 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUDIT LOG SETUP (Optional)
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can read audit logs
CREATE POLICY "Super admins can read audit logs" ON audit_log
  FOR SELECT USING (is_super_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_log
  FOR INSERT WITH CHECK (true);
