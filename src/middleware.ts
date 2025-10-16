// Temporarily disable middleware to fix redirect loop
// Auth will be handled client-side in admin components
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: []
};
