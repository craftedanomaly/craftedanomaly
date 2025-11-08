/**
 * Cloudflare R2 Storage Client
 * 
 * This client handles all R2 operations including:
 * - File uploads
 * - File listing
 * - File deletion
 * - CDN URL generation
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration
const R2_ACCOUNT_ID = process.env.NEXT_PUBLIC_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'ca-site';
const R2_CDN_URL = process.env.NEXT_PUBLIC_R2_CDN_URL || 'https://cdn.craftedanomaly.com';

// Validate required environment variables
if (!R2_ACCOUNT_ID) {
  throw new Error('R2_ACCOUNT_ID is not set. Please add NEXT_PUBLIC_R2_ACCOUNT_ID to your .env.local file.');
}

if (!R2_ACCESS_KEY_ID) {
  throw new Error('R2_ACCESS_KEY_ID is not set. Please add R2_ACCESS_KEY_ID to your .env.local file.');
}

if (!R2_SECRET_ACCESS_KEY) {
  throw new Error('R2_SECRET_ACCESS_KEY is not set. Please add R2_SECRET_ACCESS_KEY to your .env.local file.');
}

// Initialize S3 Client for R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface R2File {
  key: string;
  name: string;
  url: string;
  size: number;
  lastModified: Date;
  type: 'image' | 'video' | 'folder';
}

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  file: File,
  path?: string
): Promise<{ url: string; key: string }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    
    // Construct full path
    const key = path ? `${path}/${fileName}` : fileName;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    });

    await r2Client.send(command);

    // Return CDN URL
    const url = `${R2_CDN_URL}/${key}`;

    return { url, key };
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload file to R2');
  }
}

/**
 * List files in R2 bucket
 */
export async function listR2Files(
  prefix?: string,
  maxKeys: number = 1000
): Promise<R2File[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix || '',
      MaxKeys: maxKeys,
      Delimiter: '/',
    });

    const response = await r2Client.send(command);
    const files: R2File[] = [];

    // Add folders (common prefixes)
    if (response.CommonPrefixes) {
      for (const prefix of response.CommonPrefixes) {
        if (prefix.Prefix) {
          const folderName = prefix.Prefix.replace(/\/$/, '').split('/').pop() || '';
          files.push({
            key: prefix.Prefix,
            name: folderName,
            url: '',
            size: 0,
            lastModified: new Date(),
            type: 'folder',
          });
        }
      }
    }

    // Add files
    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key && !item.Key.endsWith('/')) {
          const name = item.Key.split('/').pop() || '';
          const isVideo = /\.(mp4|webm|mov|avi)$/i.test(name);
          
          files.push({
            key: item.Key,
            name,
            url: `${R2_CDN_URL}/${item.Key}`,
            size: item.Size || 0,
            lastModified: item.LastModified || new Date(),
            type: isVideo ? 'video' : 'image',
          });
        }
      }
    }

    return files;
  } catch (error) {
    console.error('R2 list error:', error);
    throw new Error('Failed to list files from R2');
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('R2 delete error:', error);
    throw new Error('Failed to delete file from R2');
  }
}

/**
 * Get file metadata from R2
 */
export async function getR2FileMetadata(key: string): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
}> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || '',
      lastModified: response.LastModified || new Date(),
    };
  } catch (error) {
    console.error('R2 metadata error:', error);
    throw new Error('Failed to get file metadata from R2');
  }
}

/**
 * Generate CDN URL for a file
 */
export function getR2CdnUrl(key: string): string {
  return `${R2_CDN_URL}/${key}`;
}

/**
 * Extract key from CDN URL
 */
export function extractKeyFromUrl(url: string): string {
  return url.replace(`${R2_CDN_URL}/`, '');
}
