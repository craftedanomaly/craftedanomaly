-- Add price and shop_url to media table
ALTER TABLE public.media
ADD COLUMN IF NOT EXISTS price text,
ADD COLUMN IF NOT EXISTS shop_url text;

COMMENT ON COLUMN public.media.price IS 'Price for specific poster image';
COMMENT ON COLUMN public.media.shop_url IS 'Shop link for specific poster image';
