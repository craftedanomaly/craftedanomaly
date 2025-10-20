'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface TestimonialsScrollProps {
  testimonials: string[];
}

export function TestimonialsScroll({ testimonials }: TestimonialsScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || testimonials.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Reset position when we've scrolled past the first set of images
      const itemWidth = 200; // approximate width including gap
      const totalWidth = testimonials.length * itemWidth;
      
      if (scrollPosition >= totalWidth) {
        scrollPosition = 0;
      }
      
      if (scrollContainer) {
        scrollContainer.scrollLeft = scrollPosition;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationId);
    };

    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-8 bg-background">
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-hidden items-center"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={`${testimonial}-${index}`}
            className="flex-shrink-0 w-48 h-24 relative flex items-center justify-center"
          >
            <Image
              src={testimonial}
              alt={`Award ${(index % testimonials.length) + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 192px, 192px"
              priority={index < 4}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
