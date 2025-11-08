import { createClient } from '@supabase/supabase-js';
import { HomePage } from '@/components/home/HomePage';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getHeroSlides() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching hero slides:', error);
    return [];
  }

  return (data || []).map((slide: any) => ({
    src: slide.url,
    alt: slide.title || 'Hero slide',
    caption: slide.title,
    type: slide.type || 'image',
  }));
}

async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      slug,
      title,
      blurb,
      cover_image,
      cover_video_url,
      year,
      project_categories(
        categories(
          slug
        )
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return (data || []).map((project: any) => {
    const categorySlug = project.project_categories?.[0]?.categories?.slug;

    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      blurb: project.blurb || '',
      coverImageUrl: project.cover_image || '',
      coverVideoUrl: project.cover_video_url || undefined,
      year: project.year,
      categorySlug,
      projectType: project.project_type || undefined,
    };
  });
}

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data || []).map((cat: any) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
  }));
}


export default async function Page() {
  const heroSlides = await getHeroSlides();
  const projects = await getProjects();
  const categories = await getCategories();

  return <HomePage heroSlides={heroSlides} projects={projects} categories={categories} />;
}
