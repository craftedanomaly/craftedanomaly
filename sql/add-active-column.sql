-- Add active column to categories table if it doesn't exist
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Update existing categories to be active by default
UPDATE categories SET active = TRUE WHERE active IS NULL;
