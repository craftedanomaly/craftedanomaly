-- Migration: Add video_url field to categories
-- Date: 2025-10-19
-- Description: Add video support for category hover animations

-- Add video_url column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN categories.video_url IS 'Video URL for hover animation on desktop';

-- Verification query
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name = 'video_url';

-- Sample data check
SELECT id, slug, name, video_url 
FROM categories 
LIMIT 3;
