import { CategoryPageClient } from '@/components/category/category-page-client';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getCategoryData() {
  try {
    // Get films category
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'films')
      .single();

    if (!category) return null;

    // Get projects in this category via many-to-many
    const { data: projects } = await supabase
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
        published_at,
        view_count,
        project_categories!inner(category_id)
      `)
      .eq('status', 'published')
      .eq('project_categories.category_id', category.id)
      .order('published_at', { ascending: false });

    return {
      category,
      projects: projects || [],
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return null;
  }
}

export default async function FilmsPage() {
  const data = await getCategoryData();

  if (!data) {
    return <div>Category not found</div>;
  }

  return (
    <CategoryPageClient 
      category={data.category}
      projects={data.projects}
    />
  );
}
