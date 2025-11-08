"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScrollContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const locoRef = useRef<any>(null);

  useEffect(() => {
    let cleanup = () => {};
    let mounted = true;

    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default as any;
      if (!mounted) return;
      if (!containerRef.current) return;

      // Destroy previous instance if any
      if (locoRef.current && locoRef.current.destroy) {
        try { locoRef.current.destroy(); } catch {}
        locoRef.current = null;
      }

      // Init
      locoRef.current = new LocomotiveScroll({
        el: containerRef.current,
        smooth: true,
        // Fast but eased
        lerp: 0.12,
        multiplier: 1.15,
        smartphone: { smooth: true },
        tablet: { smooth: true },
      });

      cleanup = () => {
        try { locoRef.current?.destroy(); } catch {}
        locoRef.current = null;
      };
    })();

    return () => { mounted = false; cleanup(); };
  }, []);

  // Update on route change
  useEffect(() => {
    const id = setTimeout(() => {
      try { locoRef.current?.update(); } catch {}
    }, 50);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div ref={containerRef} data-scroll-container className="min-h-screen">
      {children}
    </div>
  );
}
