-- Recovery Migration: Transfer data from old columns to new ones
-- Run this ONLY if you have old data in _en/_tr columns

-- First check if old columns still exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('title_en', 'title_tr', 'blurb_en', 'blurb_tr', 'content_en', 'content_tr');

-- If old columns exist, transfer data
-- PROJECTS
DO $$
BEGIN
    -- Check if old columns exist before trying to transfer
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title_en') THEN
        UPDATE projects 
        SET title = COALESCE(title_en, title_tr, title)
        WHERE title IS NULL OR title = '';
        
        UPDATE projects 
        SET blurb = COALESCE(blurb_en, blurb_tr, blurb)
        WHERE blurb IS NULL OR blurb = '';
        
        UPDATE projects 
        SET content = COALESCE(content_en, content_tr, content)
        WHERE content IS NULL OR content = '';
        
        UPDATE projects 
        SET role = COALESCE(role_en, role_tr, role)
        WHERE role IS NULL OR role = '';
        
        RAISE NOTICE 'Projects data transferred successfully';
    ELSE
        RAISE NOTICE 'Old columns do not exist, skipping projects transfer';
    END IF;
END $$;

-- CATEGORIES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'name_en') THEN
        UPDATE categories 
        SET name = COALESCE(name_en, name_tr, name)
        WHERE name IS NULL OR name = '';
        
        UPDATE categories 
        SET description = COALESCE(description_en, description_tr, description)
        WHERE description IS NULL OR description = '';
        
        RAISE NOTICE 'Categories data transferred successfully';
    ELSE
        RAISE NOTICE 'Old columns do not exist, skipping categories transfer';
    END IF;
END $$;

-- HERO SLIDES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hero_slides' AND column_name = 'title_en') THEN
        UPDATE hero_slides 
        SET title = COALESCE(title_en, title_tr, title)
        WHERE title IS NULL OR title = '';
        
        UPDATE hero_slides 
        SET subtitle = COALESCE(subtitle_en, subtitle_tr, subtitle)
        WHERE subtitle IS NULL OR subtitle = '';
        
        RAISE NOTICE 'Hero slides data transferred successfully';
    ELSE
        RAISE NOTICE 'Old columns do not exist, skipping hero slides transfer';
    END IF;
END $$;

-- PROJECT CONTENT BLOCKS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_content_blocks' AND column_name = 'content_en') THEN
        UPDATE project_content_blocks 
        SET content = COALESCE(content_en, content_tr, content)
        WHERE content IS NULL OR content = '';
        
        RAISE NOTICE 'Project content blocks data transferred successfully';
    ELSE
        RAISE NOTICE 'Old columns do not exist, skipping content blocks transfer';
    END IF;
END $$;

-- Verify the transfer
SELECT 
    'projects' as table_name,
    COUNT(*) as total_rows,
    COUNT(title) as has_title,
    COUNT(blurb) as has_blurb
FROM projects
UNION ALL
SELECT 
    'categories' as table_name,
    COUNT(*) as total_rows,
    COUNT(name) as has_name,
    COUNT(description) as has_description
FROM categories;

-- Show sample data
SELECT 'PROJECTS SAMPLE:' as info;
SELECT id, slug, title, blurb, status FROM projects LIMIT 3;

SELECT 'CATEGORIES SAMPLE:' as info;
SELECT id, slug, name, description FROM categories LIMIT 3;
