'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HorizontalScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function HorizontalScrollIndicator({ containerRef }: HorizontalScrollIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      setShowIndicator(!isAtEnd);
    };

    // Initial check
    checkScroll();

    // Listen to scroll events
    container.addEventListener('scroll', checkScroll);
    
    // Hide after first scroll interaction
    let hasScrolled = false;
    const handleFirstScroll = () => {
      if (!hasScrolled) {
        hasScrolled = true;
        setTimeout(() => {
          checkScroll();
        }, 2000);
      }
    };

    container.addEventListener('scroll', handleFirstScroll, { once: true });

    return () => {
      container.removeEventListener('scroll', checkScroll);
      container.removeEventListener('scroll', handleFirstScroll);
    };
  }, [containerRef]);

  if (!showIndicator) return null;

  return (
    <motion.div
      className="fixed right-8 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <motion.div
        className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30"
        animate={{
          x: [0, 8, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ChevronRight className="h-6 w-6 text-accent" />
      </motion.div>
    </motion.div>
  );
}
