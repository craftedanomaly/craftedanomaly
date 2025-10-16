-- Add missing columns to site_settings table
-- First check what columns exist and add missing ones

DO $$ 
BEGIN
    -- Add basic site info columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'site_name') THEN
        ALTER TABLE site_settings ADD COLUMN site_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'site_description') THEN
        ALTER TABLE site_settings ADD COLUMN site_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'company_name') THEN
        ALTER TABLE site_settings ADD COLUMN company_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'company_tagline') THEN
        ALTER TABLE site_settings ADD COLUMN company_tagline TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'contact_email') THEN
        ALTER TABLE site_settings ADD COLUMN contact_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'contact_phone') THEN
        ALTER TABLE site_settings ADD COLUMN contact_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'contact_address') THEN
        ALTER TABLE site_settings ADD COLUMN contact_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'logo_url') THEN
        ALTER TABLE site_settings ADD COLUMN logo_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'logo_alt') THEN
        ALTER TABLE site_settings ADD COLUMN logo_alt TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'favicon_url') THEN
        ALTER TABLE site_settings ADD COLUMN favicon_url TEXT;
    END IF;
    
    -- Add carousel settings columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'carousel_autoplay') THEN
        ALTER TABLE site_settings ADD COLUMN carousel_autoplay BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'carousel_interval') THEN
        ALTER TABLE site_settings ADD COLUMN carousel_interval INTEGER DEFAULT 5000;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'video_autoplay') THEN
        ALTER TABLE site_settings ADD COLUMN video_autoplay BOOLEAN DEFAULT true;
    END IF;
    
    -- Add about section columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'about_title_en') THEN
        ALTER TABLE site_settings ADD COLUMN about_title_en TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'about_title_tr') THEN
        ALTER TABLE site_settings ADD COLUMN about_title_tr TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'about_text_en') THEN
        ALTER TABLE site_settings ADD COLUMN about_text_en TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'about_text_tr') THEN
        ALTER TABLE site_settings ADD COLUMN about_text_tr TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'about_image_url') THEN
        ALTER TABLE site_settings ADD COLUMN about_image_url TEXT;
    END IF;
    
    -- Add footer columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'footer_explore_title') THEN
        ALTER TABLE site_settings ADD COLUMN footer_explore_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'footer_contact_title') THEN
        ALTER TABLE site_settings ADD COLUMN footer_contact_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'footer_bottom_text') THEN
        ALTER TABLE site_settings ADD COLUMN footer_bottom_text TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'footer_copyright_text') THEN
        ALTER TABLE site_settings ADD COLUMN footer_copyright_text TEXT;
    END IF;
    
    -- Add contact page columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'contact_page_title') THEN
        ALTER TABLE site_settings ADD COLUMN contact_page_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'contact_page_subtitle') THEN
        ALTER TABLE site_settings ADD COLUMN contact_page_subtitle TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'contact_info_title') THEN
        ALTER TABLE site_settings ADD COLUMN contact_info_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'contact_info_description') THEN
        ALTER TABLE site_settings ADD COLUMN contact_info_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'working_hours_title') THEN
        ALTER TABLE site_settings ADD COLUMN working_hours_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'working_hours_monday_friday') THEN
        ALTER TABLE site_settings ADD COLUMN working_hours_monday_friday TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'working_hours_saturday') THEN
        ALTER TABLE site_settings ADD COLUMN working_hours_saturday TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'working_hours_sunday') THEN
        ALTER TABLE site_settings ADD COLUMN working_hours_sunday TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'contact_consent_text') THEN
        ALTER TABLE site_settings ADD COLUMN contact_consent_text TEXT;
    END IF;
    
    -- Add homepage fields columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'homepage_fields_title_en') THEN
        ALTER TABLE site_settings ADD COLUMN homepage_fields_title_en TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'homepage_fields_title_tr') THEN
        ALTER TABLE site_settings ADD COLUMN homepage_fields_title_tr TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'homepage_fields_subtitle_en') THEN
        ALTER TABLE site_settings ADD COLUMN homepage_fields_subtitle_en TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'homepage_fields_subtitle_tr') THEN
        ALTER TABLE site_settings ADD COLUMN homepage_fields_subtitle_tr TEXT;
    END IF;
    
    -- Add social media columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'social_instagram') THEN
        ALTER TABLE site_settings ADD COLUMN social_instagram TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'social_twitter') THEN
        ALTER TABLE site_settings ADD COLUMN social_twitter TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'social_linkedin') THEN
        ALTER TABLE site_settings ADD COLUMN social_linkedin TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'social_behance') THEN
        ALTER TABLE site_settings ADD COLUMN social_behance TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'social_dribbble') THEN
        ALTER TABLE site_settings ADD COLUMN social_dribbble TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'site_settings' AND column_name = 'social_youtube') THEN
        ALTER TABLE site_settings ADD COLUMN social_youtube TEXT;
    END IF;
END $$;

-- Update RLS policies for site_settings
DROP POLICY IF EXISTS "site_settings_select_anon" ON site_settings;
DROP POLICY IF EXISTS "site_settings_update_admin" ON site_settings;

-- Allow anonymous users to read site settings
CREATE POLICY "site_settings_select_anon" ON site_settings
    FOR SELECT USING (true);

-- Allow authenticated users to update site settings (for admin)
CREATE POLICY "site_settings_update_admin" ON site_settings
    FOR ALL USING (true);

-- Ensure RLS is enabled
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Update existing settings with carousel defaults if they don't exist
UPDATE site_settings 
SET 
    carousel_autoplay = COALESCE(carousel_autoplay, true),
    carousel_interval = COALESCE(carousel_interval, 5000),
    video_autoplay = COALESCE(video_autoplay, true);

-- Insert default settings if no row exists at all
INSERT INTO site_settings (
    site_name,
    site_description,
    company_name,
    company_tagline,
    contact_email,
    contact_phone,
    contact_address,
    logo_url,
    logo_alt,
    favicon_url,
    carousel_autoplay,
    carousel_interval,
    video_autoplay,
    about_title_en,
    about_text_en
) 
SELECT 
    'Crafted Anomaly',
    'Museum-Grade Portfolio - Design Studio',
    'Crafted Anomaly',
    'Crafting Dreams Into Reality',
    'hello@craftedanomaly.com',
    '+90 xxx xxx xx xx',
    'Istanbul, Turkey',
    '/Anomaly.png',
    'Crafted Anomaly',
    '/Anomaly.png',
    true,
    5000,
    true,
    'about',
    'crafted anomaly is a design studio that transforms visions into tangible experiences.'
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);
