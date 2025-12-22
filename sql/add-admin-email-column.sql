-- Add admin_email column to site_settings table
-- This email will receive notifications from the contact form

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255) DEFAULT 'admin@craftedanomaly.com';

-- Add comment to the column
COMMENT ON COLUMN site_settings.admin_email IS 'Email address to receive contact form notifications';

-- Update existing row if exists
UPDATE site_settings 
SET admin_email = 'admin@craftedanomaly.com' 
WHERE admin_email IS NULL;
