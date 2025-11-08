/**
 * R2 List API Route
 * 
 * This API route lists files from Cloudflare R2
 */

import { NextRequest, NextResponse } from 'next/server';
import { listR2Files } from '@/lib/r2-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prefix = searchParams.get('prefix') || undefined;
    const maxKeys = parseInt(searchParams.get('maxKeys') || '1000');

    const files = await listR2Files(prefix, maxKeys);

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('List API error:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: message },
      { status: 500 }
    );
  }
}
