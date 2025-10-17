import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure Node.js runtime so server-only env vars are available
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      // Do NOT log secrets; only indicate presence/absence
      console.error('API: Missing Supabase envs', {
        hasUrl: Boolean(SUPABASE_URL),
        hasServiceRole: Boolean(SUPABASE_SERVICE_ROLE_KEY),
      });
      return NextResponse.json(
        { error: 'Server configuration error: missing Supabase environment variables.' },
        { status: 500 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      console.error('API: No email provided');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create admin client with service role (server-only)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user is in admin_users table using service role
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('role, is_active, email, auth_user_id')
      .eq('email', email)
      .single();

    if (error || !adminUser) {
      console.error('API: Admin user check error:', error);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ adminUser });

  } catch (e: unknown) {
    const err = e as Error;
    console.error('API: Check user error:', err?.message || e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
