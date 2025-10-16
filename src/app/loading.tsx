import { HeroCarouselLoading } from '@/components/home/hero-carousel-loading';
import { FieldAccordionLoading } from '@/components/home/field-accordion-loading';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div>
      {/* Hero Carousel Loading */}
      <section className="w-full">
        <HeroCarouselLoading />
      </section>

      {/* Field Accordion Loading */}
      <section className="w-full">
        <FieldAccordionLoading />
      </section>

      {/* About Section Loading */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content Loading */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-3/4" />
              </div>
              
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              
              <Skeleton className="h-10 w-40" />
            </div>

            {/* Image Loading */}
            <div className="relative">
              <Skeleton className="aspect-square w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
