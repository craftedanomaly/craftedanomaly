-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  category VARCHAR(50) DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Site settings policies (use IF NOT EXISTS to avoid conflicts)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_settings' 
        AND policyname = 'Public can view site settings'
    ) THEN
        CREATE POLICY "Public can view site settings"
          ON site_settings FOR SELECT
          USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_settings' 
        AND policyname = 'Authenticated users can manage site settings'
    ) THEN
        CREATE POLICY "Authenticated users can manage site settings"
          ON site_settings FOR ALL
          USING (auth.role() = 'authenticated')
          WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, description) VALUES
  ('site_name', 'Crafted Anomaly', 'text', 'general', 'Website name displayed in browser title'),
  ('site_description', 'Museum-Grade Portfolio - Design Studio', 'text', 'general', 'Website description for SEO'),
  ('company_name', 'Crafted Anomaly', 'text', 'general', 'Company name'),
  ('company_tagline', 'Crafting Dreams Into Reality', 'text', 'general', 'Company tagline'),
  ('contact_email', 'hello@craftedanomaly.com', 'email', 'contact', 'Primary contact email'),
  ('contact_phone', '+90 xxx xxx xx xx', 'text', 'contact', 'Contact phone number'),
  ('contact_address', 'Istanbul, Turkey', 'text', 'contact', 'Company address'),
  ('logo_url', '/Anomaly.png', 'url', 'branding', 'Main logo URL'),
  ('logo_alt', 'Crafted Anomaly', 'text', 'branding', 'Logo alt text'),
  ('favicon_url', '/favicon.ico', 'url', 'branding', 'Favicon URL'),
  ('social_instagram', '', 'url', 'social', 'Instagram profile URL'),
  ('social_twitter', '', 'url', 'social', 'Twitter profile URL'),
  ('social_linkedin', '', 'url', 'social', 'LinkedIn profile URL'),
  ('social_behance', '', 'url', 'social', 'Behance profile URL'),
  ('social_dribbble', '', 'url', 'social', 'Dribbble profile URL'),
  ('social_youtube', '', 'url', 'social', 'YouTube channel URL')
ON CONFLICT (setting_key) DO NOTHING;
