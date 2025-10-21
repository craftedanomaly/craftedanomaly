'use client';

import { useEffect, useRef } from 'react';

interface TestimonialsScrollProps {
  testimonials: string[];
}

export function TestimonialsScroll({ testimonials }: TestimonialsScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || testimonials.length === 0) return;

    let rafId: number;
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    const speed = 0.5; // px per frame

    const getSingleWidth = () => el.scrollWidth / 2; // duplicated content => half is one loop

    const tick = () => {
      if (!isDragging) {
        el.scrollLeft += speed;
        const single = getSingleWidth();
        if (el.scrollLeft >= single) el.scrollLeft -= single;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      el.scrollLeft = startScrollLeft - dx;
      const single = getSingleWidth();
      if (el.scrollLeft >= single) el.scrollLeft -= single;
      if (el.scrollLeft < 0) el.scrollLeft += single;
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      el.style.cursor = '';
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      el.scrollLeft += delta;
      const single = getSingleWidth();
      if (el.scrollLeft >= single) el.scrollLeft -= single;
      if (el.scrollLeft < 0) el.scrollLeft += single;
      e.preventDefault();
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('wheel', onWheel as any);
    };
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-6">
      <div className="mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/80">Awards & Recognition</h3>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto items-center py-2 scrollbar-hide cursor-grab select-none"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={`${testimonial}-${index}`}
            className="flex-shrink-0 h-16 flex items-center justify-center"
          >
            <img
              src={testimonial}
              alt={`Award ${(index % testimonials.length) + 1}`}
              className="max-h-16 object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
