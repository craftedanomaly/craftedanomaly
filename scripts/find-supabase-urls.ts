/**
 * List Supabase Storage URLs in database tables
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface TableColumn {
  table: string;
  column: string;
}

const mappings: TableColumn[] = [
  { table: 'projects', column: 'cover_image' },
  { table: 'projects', column: 'hero_image' },
  { table: 'categories', column: 'cover_image' },
  { table: 'categories', column: 'hover_video' },
  { table: 'hero_slides', column: 'url' },
  { table: 'gallery_images', column: 'url' },
  { table: 'content_blocks', column: 'image_url' },
  { table: 'site_settings', column: 'logo_url' },
  { table: 'site_settings', column: 'logo_light_url' },
  { table: 'site_settings', column: 'logo_dark_url' },
  { table: 'site_settings', column: 'favicon_url' },
  { table: 'site_settings', column: 'about_image_url' },
];

async function findSupabaseUrls() {
  console.log('🔍 Searching for Supabase Storage URLs...');

  for (const { table, column } of mappings) {
    const { data, error } = await supabase
      .from(table)
      .select(`id, ${column}`)
      .like(column, '%supabase.co/storage%');

    if (error) {
      console.error(`❌ Error querying ${table}.${column}:`, error.message);
      continue;
    }

    if (!data || data.length === 0) {
      continue;
    }

    console.log(`\n📁 ${table}.${column}`);
    for (const row of data) {
      const record = row as unknown as Record<string, unknown>;
      const value = record[column] as string | null | undefined;
      const rowId = record.id ?? '(no id)';
      console.log(`  • id=${rowId}: ${value ?? '(empty)'}`);
    }
  }

  console.log('\n✅ Done.');
}

findSupabaseUrls().catch((err) => {
  console.error('Unexpected error:', err);
});
