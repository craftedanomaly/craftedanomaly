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

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let hoverActive = false;
    let hoverX = 0;
    let panRaf = 0;

    const updateScales = () => {
      const containerRect = el.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const items = Array.from(el.querySelectorAll('[data-t-item="1"]')) as HTMLDivElement[];
      for (const item of items) {
        const r = item.getBoundingClientRect();
        const itemCenter = r.left + r.width / 2;
        const dist = Math.abs(itemCenter - centerX);
        const maxDist = containerRect.width / 2;
        const t = Math.max(0, 1 - dist / maxDist); // 1 at center -> 0 at far edge
        const scale = 0.6 + 0.4 * t; // 0.6..1.0
        const opacity = 0.5 + 0.5 * t; // 0.5..1
        item.style.transform = `scale(${scale})`;
        item.style.opacity = `${opacity}`;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    };
    const onPointerMove = (e: PointerEvent) => {
      hoverX = e.clientX;
      if (!isDragging) return;
      const dx = e.clientX - startX;
      el.scrollLeft = startScrollLeft - dx;
      updateScales();
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      el.style.cursor = '';
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      el.scrollLeft += delta;
      updateScales();
      e.preventDefault();
    };
    const onScroll = () => updateScales();
    const onResize = () => updateScales();

    const onPointerEnter = () => { hoverActive = true; };
    const onPointerLeave = () => { hoverActive = false; };

    const edgePanTick = () => {
      if (hoverActive && !isDragging) {
        const rect = el.getBoundingClientRect();
        const margin = Math.max(40, rect.width * 0.15);
        let speed = 0;
        if (hoverX < rect.left + margin) {
          const ratio = (rect.left + margin - hoverX) / margin; // 0..1
          speed = -6 * ratio; // px/frame
        } else if (hoverX > rect.right - margin) {
          const ratio = (hoverX - (rect.right - margin)) / margin;
          speed = 6 * ratio;
        }
        if (speed !== 0) {
          el.scrollLeft += speed;
          updateScales();
        }
      }
      panRaf = requestAnimationFrame(edgePanTick);
    };
    panRaf = requestAnimationFrame(edgePanTick);

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('pointerenter', onPointerEnter);
    el.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);

    // initial
    updateScales();

    return () => {
      cancelAnimationFrame(panRaf);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('wheel', onWheel as any);
      el.removeEventListener('scroll', onScroll as any);
      el.removeEventListener('pointerenter', onPointerEnter as any);
      el.removeEventListener('pointerleave', onPointerLeave as any);
      window.removeEventListener('resize', onResize);
    };
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const list = testimonials;

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
        {list.map((testimonial, index) => (
          <div
            key={`${testimonial}-${index}`}
            className="flex-shrink-0 h-16 flex items-center justify-center transition-transform duration-150 will-change-transform"
            data-t-item="1"
          >
            <img
              src={testimonial}
              alt={`Award ${index + 1}`}
              className="max-h-16 object-contain"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
