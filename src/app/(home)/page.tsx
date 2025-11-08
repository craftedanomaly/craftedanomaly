import { HeroCarousel } from '@/components/HeroCarousel';
import { CategorySideNav } from '@/components/CategorySideNav';
import { CategorySection } from '@/components/CategorySection';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CDN = process.env.NEXT_PUBLIC_R2_CDN_URL || '';

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

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, description, cover_image, video_url, display_order, active')
    .eq('active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data || []).map((cat: any) => ({
    id: cat.id,
    slug: cat.slug,
    title: cat.name,
    coverImageUrl: cat.cover_image || '',
    coverVideoUrl: cat.video_url || '',
  }));
}

async function getProjectsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, slug, title, blurb, year, cover_image')
    .eq('category_id', categoryId)
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error(`Error fetching projects for category ${categoryId}:`, error);
    return [];
  }

  return (data || []).map((project: any) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    blurb: project.blurb || '',
    year: project.year,
    coverImageUrl: project.cover_image || '',
  }));
}

export default async function HomePage() {
  const heroSlides = await getHeroSlides();
  const categories = await getCategories();

  // Fetch projects for each category
  const categoriesWithProjects = await Promise.all(
    categories.map(async (category) => {
      const projects = await getProjectsByCategory(category.id);
      return {
        ...category,
        projects,
      };
    })
  );

  return (
    <main className="relative min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Category Side Navigation */}
      <CategorySideNav
        categories={categories}
        activeSlug={categories[0]?.slug || ''}
      />

      {/* Category Sections */}
      <div className="relative">
        {categoriesWithProjects.map((category) => (
          <CategorySection
            key={category.id}
            id={category.id}
            slug={category.slug}
            title={category.title}
            projects={category.projects}
          />
        ))}
      </div>
    </main>
  );
}
