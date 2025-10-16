import { HeroCarousel } from '@/components/home/hero-carousel';
import { FieldAccordion } from '@/components/home/field-accordion';
import { createClient } from '@supabase/supabase-js';

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

async function getCategoriesWithProjects() {
  // Fetch all categories with cover_image
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug, name_en, name_tr, description_en, description_tr, cover_image, display_order, active')
    .eq('active', true)
    .order('display_order');

  if (catError) {
    console.error('Error fetching categories:', catError);
    return [];
  }

  // Fetch 4 projects for each category
  const categoriesWithProjects = await Promise.all(
    (categories || []).map(async (category) => {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, slug, title_en, title_tr, cover_image, category_id')
        .eq('category_id', category.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(4);

      return {
        ...category,
        projects: projects || [],
      };
    })
  );

  return categoriesWithProjects;
}

async function getAboutSettings() {
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .in('setting_key', ['about_title_en', 'about_text_en', 'about_image_url']);

  const settings: any = {
    about_title_en: 'about',
    about_text_en: 'crafted anomaly is a design studio that transforms visions into tangible experiences. we specialize in creating museum-grade portfolios that blur the lines between art and functionality.',
    about_image_url: ''
  };

  data?.forEach((setting: any) => {
    settings[setting.setting_key] = setting.setting_value || settings[setting.setting_key];
  });

  return settings;
}

export default async function Home() {
  const heroSlides = await getHeroSlides();
  const carouselSettings = await getCarouselSettings();
  const categories = await getCategoriesWithProjects();
  const aboutSettings = await getAboutSettings();

  return (
    <div>
      {/* Hero Carousel - Full Width */}
      <section className="w-full">
        <HeroCarousel 
          slides={heroSlides} 
          autoPlay={carouselSettings.autoPlay}
          autoPlayInterval={carouselSettings.slideInterval}
          videoAutoPlay={carouselSettings.videoAutoPlay}
        />
      </section>

      {/* Field Accordion Cards - Full Width */}
      <section className="w-full">
        <FieldAccordion categories={categories} locale="en" />
      </section>

      {/* About Section */}
      <section className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6" style={{ fontFamily: 'BBH Sans Bartle, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              {aboutSettings.about_title_en}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {aboutSettings.about_text_en}
            </p>
          </div>
          <div className="bg-card rounded-lg aspect-video flex items-center justify-center overflow-hidden">
            {aboutSettings.about_image_url ? (
              <img
                src={aboutSettings.about_image_url}
                alt="Studio Image"
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-muted-foreground">Studio Image Placeholder</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
