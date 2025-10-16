import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CategoryPageClient } from '@/components/category/category-page-client';

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

    const title = category.name_en;
    const description = category.description_en || `Explore our ${category.name_en?.toLowerCase()} portfolio`;

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
        title_en,
        title_tr,
        blurb_en,
        blurb_tr,
        cover_image,
        year,
        role_en,
        role_tr,
        client,
        published_at,
        view_count
      `)
      .eq('category_id', category.id)
      .eq('status', 'published')
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
      locale={"en"}
    />
  );
}
