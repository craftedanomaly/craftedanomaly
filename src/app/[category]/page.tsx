import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CategoryPageClient } from '@/components/category/category-page-client';

// Ensure newly created projects appear immediately without a full rebuild
export const dynamic = 'force-dynamic';

// Revalidate every 60 seconds - ISR strategy
export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Generate static params for known categories (single-locale)
export async function generateStaticParams() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: categories } = await supabaseServer
      .from('categories')
      .select('slug')
      .eq('active', true);

    if (!categories) return [];

    return categories.map((c: any) => ({ category: c.slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for the category page (English only)
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const { category: categorySlug } = await params;
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: category } = await supabaseServer
      .from('categories')
      .select('*')
      .eq('slug', categorySlug)
      .eq('active', true)
      .single();

    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'The requested category could not be found.',
      };
    }

    const title = category.name;
    const description = category.description || `Explore our ${category.name?.toLowerCase()} portfolio`;

    return {
      title: `${title} | Crafted Anomaly`,
      description,
      openGraph: {
        title: `${title} | Crafted Anomaly`,
        description,
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Category | Crafted Anomaly',
      description: 'Explore our portfolio categories',
    };
  }
}

async function getCategoryData(slug: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get category details
    const { data: category, error: categoryError } = await supabaseServer
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (categoryError || !category) {
      return null;
    }

    // Get projects in this category
    const { data: projects } = await supabaseServer
      .from('projects')
      .select(`
        id,
        slug,
        title,
        blurb,
        cover_image,
        cover_video_url,
        year,
        role_en,
        role_tr,
        client,
        project_type,
        published_at,
        view_count,
        project_categories!inner(
          category_id
        )
      `)
      .eq('status', 'published')
      .eq('project_categories.category_id', category.id)
      .order('published_at', { ascending: false });

    // Get all tags for projects in this category
    const projectIds = projects?.map(p => p.id) || [];
    let projectTags: any[] | null = [];
    if (projectIds.length > 0) {
      const { data } = await supabaseServer
        .from('project_tags')
        .select(`
          project_id,
          tag_id,
          tags:tag_id (
            id,
            slug,
            name,
            name_en,
            name_tr
          )
        `)
        .in('project_id', projectIds);
      projectTags = data || [];
    } else {
      projectTags = [];
    }

    // Build a map of project_id to tags
    const projectTagsMap = new Map<string, any[]>();
    projectTags?.forEach((pt: any) => {
      if (pt.tags) {
        const existing = projectTagsMap.get(pt.project_id) || [];
        const tagData = pt.tags;
        // Ensure we have valid tag data
        if (tagData && tagData.id) {
          projectTagsMap.set(pt.project_id, [...existing, tagData]);
        }
      }
    });

    // Add tags to each project
    const projectsWithTags = projects?.map(project => ({
      ...project,
      tags: projectTagsMap.get(project.id) || []
    })) || [];

    // Get unique tags for the filter
    const allTags = Array.from(
      new Map(
        (projectTags || [])
          .map((pt: any) => pt.tags)
          .filter(Boolean)
          .map((tag: any) => {
            const name = tag?.name || tag?.name_en || tag?.name_tr || tag?.slug || 'tag';
            return [tag.id, { id: tag.id, slug: tag.slug, name }];
          })
      ).values()
    );

    return {
      category,
      projects: projectsWithTags,
      availableTags: allTags,
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return null;
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const data = await getCategoryData(categorySlug);

  if (!data) {
    notFound();
  }

  return (
    <CategoryPageClient 
      category={data.category}
      projects={data.projects}
      availableTags={data.availableTags || []}
    />
  );
}
