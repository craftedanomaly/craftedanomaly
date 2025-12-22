-- Debug: Check existing projects and their data
-- Run this in Supabase SQL Editor to see what's in the database

-- Check projects table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- Check existing projects
SELECT 
  id, 
  slug, 
  title,
  blurb,
  status,
  category_id,
  created_at
FROM projects 
ORDER BY created_at DESC
LIMIT 10;

-- Check categories
SELECT 
  id,
  slug,
  name,
  active
FROM categories
ORDER BY display_order;

-- Check if any projects have the old column names
SELECT 
  id,
  slug,
  CASE 
    WHEN title IS NOT NULL THEN 'NEW: title'
    ELSE 'OLD: no title'
  END as title_status,
  CASE 
    WHEN blurb IS NOT NULL THEN 'NEW: blurb'
    ELSE 'OLD: no blurb'
  END as blurb_status
FROM projects
LIMIT 5;
