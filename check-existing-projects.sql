-- Check what's actually in the projects table
-- This will help us understand why projects are showing 404

-- First, check the table structure
\d projects;

-- Check existing projects with all their data
SELECT 
  id,
  slug,
  title,
  blurb,
  status,
  category_id,
  created_at,
  updated_at
FROM projects 
WHERE status = 'published'
ORDER BY created_at DESC;

-- Check if there are any NULL values in critical fields
SELECT 
  COUNT(*) as total_projects,
  COUNT(title) as has_title,
  COUNT(blurb) as has_blurb,
  COUNT(slug) as has_slug
FROM projects 
WHERE status = 'published';

-- Check specific project that's causing 404
-- Replace 'your-project-slug' with actual slug from admin panel
SELECT * FROM projects WHERE slug = 'your-project-slug' LIMIT 1;
