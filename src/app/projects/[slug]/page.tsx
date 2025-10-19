import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProjectDetailClient from '@/components/projects/project-detail-client';

// Revalidate every 60 seconds - ISR strategy
export const revalidate = 60;

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for known projects
export async function generateStaticParams() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: projects } = await supabaseServer
      .from('projects')
      .select('slug')
      .eq('status', 'published');

    if (!projects) return [];

    return projects.map(project => ({ slug: project.slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for the project page
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: project } = await supabaseServer
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!project) {
      return {
        title: 'Project Not Found | Crafted Anomaly'
      };
    }

    const title = project.title;
    const description = project.blurb;

    return {
      title: `${title} | Crafted Anomaly`,
      description,
      openGraph: {
        title: `${title} | Crafted Anomaly`,
        description,
        type: 'article',
        images: project.cover_image ? [project.cover_image] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Project Not Found | Crafted Anomaly'
    };
  }
}

async function getProjectData(slug: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: project, error: projectError } = await supabaseServer
      .from('projects')
      .select(`
        *,
        project_categories (
          categories (
            id,
            slug,
            name
          )
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (projectError || !project) {
      console.error('Project fetch error:', projectError);
      console.log('Attempted slug:', slug);
      return null;
    }

    // Additional validation for required fields
    if (!project.title || !project.slug) {
      console.error('Project missing required fields:', { 
        id: project?.id, 
        slug: project?.slug, 
        title: project?.title 
      });
      return null;
    }

    // Get project media
    const { data: media } = await supabaseServer
      .from('media')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order');

    // Get project tags
    const { data: tags } = await supabaseServer
      .from('project_tags')
      .select(`
        tags (
          id,
          slug,
          name
        )
      `)
      .eq('project_id', project.id);

    // Get content blocks
    const { data: blocks } = await supabaseServer
      .from('project_content_blocks')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order');

    return {
      project,
      media: media || [],
      tags: tags?.map(t => t.tags).flat().filter(Boolean) || [],
      blocks: blocks || [],
    };
  } catch (error) {
    console.error('Error fetching project data:', error);
    return null;
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const data = await getProjectData(slug);

  if (!data) {
    notFound();
  }

  return (
    <ProjectDetailClient 
      project={data.project}
      media={data.media}
      tags={data.tags}
      blocks={data.blocks}
    />
  );
}
