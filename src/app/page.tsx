import { HeroToCategories } from '@/components/home/hero-to-categories';
import { createClient } from '@supabase/supabase-js';

// Always fetch fresh data for homepage content
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

  return data || [];
}

async function getCarouselSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('carousel_autoplay, carousel_interval, video_autoplay')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching carousel settings:', error);
    return {
      autoPlay: true,
      slideInterval: 5000,
      videoAutoPlay: true
    };
  }

  return {
    autoPlay: data?.carousel_autoplay ?? true,
    slideInterval: data?.carousel_interval ?? 5000,
    videoAutoPlay: data?.video_autoplay ?? true
  };
}

async function getCategories() {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug, name, description, cover_image, video_url, display_order, active')
    .eq('active', true)
    .order('display_order');

  if (catError) {
    console.error('Error fetching categories:', catError);
    return [];
  }

  return categories || [];
}


export default async function Home() {
  const heroSlides = await getHeroSlides();
  const carouselSettings = await getCarouselSettings();
  const categories = await getCategories();

  return (
    <HeroToCategories 
      slides={heroSlides}
      categories={categories}
      autoPlay={carouselSettings.autoPlay}
      autoPlayInterval={carouselSettings.slideInterval}
      videoAutoPlay={carouselSettings.videoAutoPlay}
    />
  );
}
