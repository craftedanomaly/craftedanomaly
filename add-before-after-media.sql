-- Add before/after support to media table
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS before_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS after_url VARCHAR(500);

-- Update media_type check constraint to include before_after
ALTER TABLE media 
DROP CONSTRAINT IF EXISTS media_media_type_check;

ALTER TABLE media 
ADD CONSTRAINT media_media_type_check 
CHECK (media_type IN ('image', 'video', 'document', 'before_after'));
