/**
 * R2 Upload API Route
 * 
 * This API route handles file uploads to Cloudflare R2
 * It's a server-side route to keep R2 credentials secure
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to R2
    const result = await uploadToR2(file, path || undefined);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
