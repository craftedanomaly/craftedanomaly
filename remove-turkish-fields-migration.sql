-- Migration: Remove Turkish Language Fields
-- Date: 2025-10-19
-- Description: Since the site is now English-only, we're removing all Turkish (_tr) fields
-- and renaming _en fields to remove the language suffix.

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================

-- Rename English fields to generic names
ALTER TABLE site_settings 
RENAME COLUMN about_title_en TO about_title;

ALTER TABLE site_settings 
RENAME COLUMN about_text_en TO about_text;

ALTER TABLE site_settings 
RENAME COLUMN homepage_fields_title_en TO homepage_fields_title;

ALTER TABLE site_settings 
RENAME COLUMN homepage_fields_subtitle_en TO homepage_fields_subtitle;

-- Drop Turkish fields
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

-- Migrate data from content_en to content (if content is empty)
UPDATE project_content_blocks 
SET content = content_en 
WHERE content IS NULL AND content_en IS NOT NULL;

-- Drop old language-specific columns
ALTER TABLE project_content_blocks 
DROP COLUMN IF EXISTS content_en;

ALTER TABLE project_content_blocks 
DROP COLUMN IF EXISTS content_tr;

-- ============================================
-- PROJECTS TABLE (if has TR fields)
-- ============================================

-- Note: Check if your projects table has _tr fields
-- If yes, add migration steps here similar to above

-- Example (uncomment if needed):
-- ALTER TABLE projects RENAME COLUMN title_en TO title;
-- ALTER TABLE projects DROP COLUMN IF EXISTS title_tr;
-- ALTER TABLE projects RENAME COLUMN blurb_en TO blurb;
-- ALTER TABLE projects DROP COLUMN IF EXISTS blurb_tr;

-- ============================================
-- CATEGORIES TABLE (if has TR fields)
-- ============================================

-- Example (uncomment if needed):
-- ALTER TABLE categories RENAME COLUMN name_en TO name;
-- ALTER TABLE categories DROP COLUMN IF EXISTS name_tr;
-- ALTER TABLE categories RENAME COLUMN description_en TO description;
-- ALTER TABLE categories DROP COLUMN IF EXISTS description_tr;

-- ============================================
-- HERO SLIDES TABLE (if has TR fields)
-- ============================================

-- Example (uncomment if needed):
-- ALTER TABLE hero_slides RENAME COLUMN title_en TO title;
-- ALTER TABLE hero_slides DROP COLUMN IF EXISTS title_tr;
-- ALTER TABLE hero_slides RENAME COLUMN subtitle_en TO subtitle;
-- ALTER TABLE hero_slides DROP COLUMN IF EXISTS subtitle_tr;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check site_settings columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
ORDER BY ordinal_position;

-- Check project_content_blocks columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_content_blocks' 
ORDER BY ordinal_position;

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
