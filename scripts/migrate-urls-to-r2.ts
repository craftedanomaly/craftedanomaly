/**
 * Migration Script: Supabase Storage URLs → R2 CDN URLs
 * 
 * Bu script database'deki tüm Supabase Storage URL'lerini
 * Cloudflare R2 CDN URL'lerine çevirir.
 * 
 * KULLANIM:
 * 1. Önce dosyaları Supabase'den R2'ye manuel olarak taşıyın
 * 2. Bu scripti çalıştırın: npx tsx scripts/migrate-urls-to-r2.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const r2CdnUrl = process.env.NEXT_PUBLIC_R2_CDN_URL || 'https://cdn.craftedanomaly.com';

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface UrlMapping {
  table: string;
  column: string;
  idColumn?: string;
}

// Database'de URL içeren tüm tablolar ve kolonlar
const urlMappings: UrlMapping[] = [
  // Projects
  { table: 'projects', column: 'cover_image' },
  { table: 'projects', column: 'hero_image' },
  
  // Categories
  { table: 'categories', column: 'cover_image' },
  { table: 'categories', column: 'hover_video' },
  
  // Hero Slides
  { table: 'hero_slides', column: 'url' },
  
  // Media
  { table: 'media', column: 'url' },
  
  // Gallery Images
  { table: 'gallery_images', column: 'url' },
  
  // Content Blocks
  { table: 'content_blocks', column: 'image_url' },
  
  // Site Settings
  { table: 'site_settings', column: 'logo_url' },
  { table: 'site_settings', column: 'logo_light_url' },
  { table: 'site_settings', column: 'logo_dark_url' },
  { table: 'site_settings', column: 'favicon_url' },
  { table: 'site_settings', column: 'about_image_url' },
];

async function findFileInR2(bucket: string, basePath: string): Promise<string | null> {
  // R2'de dosyayı farklı uzantılarla dene
  const extensions = ['avif', 'webp', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov'];
  
  for (const ext of extensions) {
    // R2'de bucket klasörü yok, dosyalar direkt root'ta
    const testUrl = bucket 
      ? `${r2CdnUrl}/${bucket}/${basePath}.${ext}`
      : `${r2CdnUrl}/${basePath}.${ext}`;
    
    try {
      // HEAD request ile dosyanın var olup olmadığını kontrol et
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log(`    ✓ Found: ${testUrl}`);
        return testUrl;
      }
    } catch (error) {
      // Devam et
    }
  }
  
  return null; // Dosya bulunamadı
}

async function convertSupabaseUrlToR2(supabaseUrl: string): Promise<string | null> {
  // Supabase Storage URL pattern:
  // https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
  
  const supabasePattern = /https:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/public\/([^\/]+)\/(.+)/;
  const match = supabaseUrl.match(supabasePattern);
  
  if (!match) {
    return null; // Not a Supabase Storage URL
  }
  
  const [, bucket, path] = match;
  
  // R2'de bucket klasörü yok, dosyalar direkt root'ta
  // Supabase: media/hero-slides/abc.jpg
  // R2:       hero-slides/abc.avif (media/ prefix'i yok)
  
  // Dosya ismini uzantısız al
  // Örnek: hero-slides/abc123.jpg → hero-slides/abc123
  const pathWithoutExt = path.replace(/\.(jpg|jpeg|png|gif|webp|avif|mp4|webm|mov)$/i, '');
  
  // R2'de dosyayı farklı uzantılarla ara (bucket prefix'siz)
  const r2Url = await findFileInR2('', pathWithoutExt); // Bucket boş string
  
  if (!r2Url) {
    console.log(`    ⚠️  File not found in R2: ${pathWithoutExt}.*`);
    return null;
  }
  
  return r2Url;
}

async function migrateTable(mapping: UrlMapping) {
  console.log(`\n🔄 Migrating ${mapping.table}.${mapping.column}...`);
  
  try {
    // Fetch all records with URLs
    const { data: records, error: fetchError } = await supabase
      .from(mapping.table)
      .select('id, ' + mapping.column)
      .not(mapping.column, 'is', null);
    
    if (fetchError) {
      console.error(`❌ Error fetching ${mapping.table}:`, fetchError);
      return;
    }
    
    if (!records || records.length === 0) {
      console.log(`✅ No records to migrate in ${mapping.table}.${mapping.column}`);
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const record of records) {
      const oldUrl = (record as any)[mapping.column];
      const recordId = (record as any).id;
      
      if (!oldUrl || typeof oldUrl !== 'string') {
        skippedCount++;
        continue;
      }
      
      // Convert URL (async)
      const newUrl = await convertSupabaseUrlToR2(oldUrl);
      
      if (!newUrl) {
        // Not a Supabase URL or file not found in R2
        skippedCount++;
        continue;
      }
      
      // Update record
      const { error: updateError } = await supabase
        .from(mapping.table)
        .update({ [mapping.column]: newUrl })
        .eq('id', recordId);
      
      if (updateError) {
        console.error(`❌ Error updating ${mapping.table} id=${recordId}:`, updateError);
      } else {
        migratedCount++;
        console.log(`  ✓ ${oldUrl} → ${newUrl}`);
      }
    }
    
    console.log(`✅ ${mapping.table}.${mapping.column}: ${migratedCount} migrated, ${skippedCount} skipped`);
    
  } catch (error) {
    console.error(`❌ Error in ${mapping.table}.${mapping.column}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting URL migration from Supabase Storage to R2 CDN...');
  console.log(`📍 R2 CDN URL: ${r2CdnUrl}`);
  
  for (const mapping of urlMappings) {
    await migrateTable(mapping);
  }
  
  console.log('\n✅ Migration completed!');
  console.log('\n⚠️  IMPORTANT: Make sure you have copied all files from Supabase Storage to R2 before using the new URLs!');
}

main().catch(console.error);
