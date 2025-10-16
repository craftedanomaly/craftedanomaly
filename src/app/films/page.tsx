import { CategoryPageClient } from '@/components/category/category-page-client';
import { createClient } from '@supabase/supabase-js';

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

    // Get projects in this category
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('category_id', category.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

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
