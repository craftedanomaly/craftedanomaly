import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get current project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, view_count')
      .eq('slug', slug)
      .single();

    if (fetchError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Increment view count
    const { error: updateError } = await supabase
      .from('projects')
      .update({ view_count: (project.view_count || 0) + 1 })
      .eq('id', project.id);

    if (updateError) {
      console.error('Error updating view count:', updateError);
      return NextResponse.json(
        { error: 'Failed to update view count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      view_count: (project.view_count || 0) + 1
    });
  } catch (error) {
    console.error('Error in view count API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
