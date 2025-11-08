'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface LocomotiveScrollWrapperProps {
  children: ReactNode;
}

export function LocomotiveScrollWrapper({ children }: LocomotiveScrollWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const locomotiveScrollRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initLocomotiveScroll = async () => {
      try {
        const LocomotiveScroll = (await import('locomotive-scroll')).default;

        if (!isMounted || !scrollRef.current) return;

        locomotiveScrollRef.current = new LocomotiveScroll({
          el: scrollRef.current,
          smooth: true,
          multiplier: 1,
          class: 'is-inview',
          smartphone: {
            smooth: true,
          },
          tablet: {
            smooth: true,
          },
        });

        // Update on window resize
        const handleResize = () => {
          if (locomotiveScrollRef.current) {
            locomotiveScrollRef.current.update();
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Error initializing Locomotive Scroll:', error);
      }
    };

    initLocomotiveScroll();

    return () => {
      isMounted = false;
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.destroy();
        locomotiveScrollRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={scrollRef} data-scroll-container>
      {children}
    </div>
  );
}
