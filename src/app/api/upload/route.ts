/**
 * Legacy upload route - now redirects to R2
 * This route is kept for backward compatibility
 */

import { NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2-client';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to R2 instead of Supabase (no media/ prefix)
    const result = await uploadToR2(file, 'uploads');

    return NextResponse.json({ url: result.url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
