-- Add price and shop_url columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS price text,
ADD COLUMN IF NOT EXISTS shop_url text;

-- Add comments for documentation
COMMENT ON COLUMN public.projects.price IS 'Display price for Poster Design Layout';
COMMENT ON COLUMN public.projects.shop_url IS 'External shop link for Poster Design Layout';
