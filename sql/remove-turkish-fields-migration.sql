-- Migration: Remove Turkish Language Fields
-- Date: 2025-10-19
-- Description: Since the site is now English-only, we're removing all Turkish (_tr) fields
-- and renaming _en fields to remove the language suffix.

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================

-- Rename English fields to generic names (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_title_en') THEN
        ALTER TABLE site_settings RENAME COLUMN about_title_en TO about_title;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'about_text_en') THEN
        ALTER TABLE site_settings RENAME COLUMN about_text_en TO about_text;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'homepage_fields_title_en') THEN
        ALTER TABLE site_settings RENAME COLUMN homepage_fields_title_en TO homepage_fields_title;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'homepage_fields_subtitle_en') THEN
        ALTER TABLE site_settings RENAME COLUMN homepage_fields_subtitle_en TO homepage_fields_subtitle;
    END IF;
END $$;

-- Drop Turkish fields (safe with IF EXISTS)
ALTER TABLE site_settings 
DROP COLUMN IF EXISTS about_title_tr;

ALTER TABLE site_settings 
DROP COLUMN IF EXISTS about_text_tr;

ALTER TABLE site_settings 
DROP COLUMN IF EXISTS homepage_fields_title_tr;

ALTER TABLE site_settings 
DROP COLUMN IF EXISTS homepage_fields_subtitle_tr;

-- ============================================
-- PROJECT CONTENT BLOCKS TABLE
-- ============================================

-- Add new content column if it doesn't exist
ALTER TABLE project_content_blocks 
ADD COLUMN IF NOT EXISTS content TEXT;

-- Migrate data from content_en to content (only if content_en exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_content_blocks' AND column_name = 'content_en') THEN
        UPDATE project_content_blocks 
        SET content = content_en 
        WHERE content IS NULL AND content_en IS NOT NULL;
    END IF;
END $$;

-- Drop old language-specific columns (safe with IF EXISTS)
ALTER TABLE project_content_blocks 
DROP COLUMN IF EXISTS content_en;

ALTER TABLE project_content_blocks 
DROP COLUMN IF EXISTS content_tr;

-- ============================================
-- PROJECTS TABLE
-- ============================================

-- Rename English fields to generic names (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title_en') THEN
        ALTER TABLE projects RENAME COLUMN title_en TO title;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'blurb_en') THEN
        ALTER TABLE projects RENAME COLUMN blurb_en TO blurb;
    END IF;
END $$;

-- Drop Turkish fields (safe with IF EXISTS)
ALTER TABLE projects 
DROP COLUMN IF EXISTS title_tr;

ALTER TABLE projects 
DROP COLUMN IF EXISTS blurb_tr;

-- ============================================
-- CATEGORIES TABLE
-- ============================================

-- Rename English fields to generic names (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'name_en') THEN
        ALTER TABLE categories RENAME COLUMN name_en TO name;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'description_en') THEN
        ALTER TABLE categories RENAME COLUMN description_en TO description;
    END IF;
END $$;

-- Drop Turkish fields (safe with IF EXISTS)
ALTER TABLE categories 
DROP COLUMN IF EXISTS name_tr;

ALTER TABLE categories 
DROP COLUMN IF EXISTS description_tr;

-- ============================================
-- HERO SLIDES TABLE
-- ============================================

-- Rename English fields to generic names (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_slides' AND column_name = 'title_en') THEN
        ALTER TABLE hero_slides RENAME COLUMN title_en TO title;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_slides' AND column_name = 'subtitle_en') THEN
        ALTER TABLE hero_slides RENAME COLUMN subtitle_en TO subtitle;
    END IF;
END $$;

-- Drop Turkish fields (safe with IF EXISTS)
ALTER TABLE hero_slides 
DROP COLUMN IF EXISTS title_tr;

ALTER TABLE hero_slides 
DROP COLUMN IF EXISTS subtitle_tr;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all updated tables
SELECT 'site_settings' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
UNION ALL
SELECT 'projects' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
UNION ALL
SELECT 'categories' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
UNION ALL
SELECT 'hero_slides' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hero_slides' 
UNION ALL
SELECT 'project_content_blocks' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_content_blocks' 
ORDER BY table_name, column_name;

-- ============================================
-- NOTES
-- ============================================

/*
IMPORTANT: 
1. Backup your database before running this migration!
2. Test on a development/staging environment first
3. Some tables may already have the correct schema - the IF EXISTS/IF NOT EXISTS clauses handle this
4. Check the commented sections for other tables (projects, categories, hero_slides) 
   and uncomment/modify as needed for your schema
5. After migration, update your frontend code to use the new field names
*/
