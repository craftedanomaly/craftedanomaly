# Environment Variables Template

`.env.local` dosyanıza kopyalayın:

```env
# Supabase Configuration (Auth & Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudflare R2 Configuration (Storage)
NEXT_PUBLIC_R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
NEXT_PUBLIC_R2_BUCKET_NAME=ca-site
NEXT_PUBLIC_R2_CDN_URL=https://cdn.craftedanomaly.com

# Other Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Nereden Bulacaksınız?

### Supabase (Mevcut - Değişmedi):
- Dashboard: https://supabase.com/dashboard
- Project Settings > API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key

### Cloudflare R2 (Yeni):
- Dashboard: https://dash.cloudflare.com
- R2 > Manage R2 API Tokens
- `NEXT_PUBLIC_R2_ACCOUNT_ID`: Account ID (sağ üstte)
- `R2_ACCESS_KEY_ID`: Create API Token'dan alın
- `R2_SECRET_ACCESS_KEY`: Create API Token'dan alın
- `NEXT_PUBLIC_R2_BUCKET_NAME`: ca-site (sabit)
- `NEXT_PUBLIC_R2_CDN_URL`: https://cdn.craftedanomaly.com (sabit)
