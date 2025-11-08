'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '70%']);
  
  // Appear during scroll (0.1 to 0.6), then fade out
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.4, 0.7, 1], [0, 1, 1, 0.3, 0]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[1] pointer-events-none overflow-hidden"
      style={{ height: '200vh' }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ opacity }}
      >
        {/* SVG Shape 1 - Circle */}
        <motion.svg
          className="absolute top-20 right-10 w-64 h-64 md:w-96 md:h-96"
          style={{ y: y1 }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent/20"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r="60"
            stroke="currentColor"
            strokeWidth="1"
            className="text-accent/10"
            fill="none"
          />
        </motion.svg>

        {/* SVG Shape 2 - Triangle */}
        <motion.svg
          className="absolute bottom-40 left-20 w-48 h-48 md:w-72 md:h-72"
          style={{ y: y2 }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 20 L180 180 L20 180 Z"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/20"
            fill="none"
          />
          <path
            d="M100 50 L150 150 L50 150 Z"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary/10"
            fill="none"
          />
        </motion.svg>

        {/* SVG Shape 3 - Rectangle */}
        <motion.svg
          className="absolute top-1/2 left-1/4 w-56 h-56 md:w-80 md:h-80"
          style={{ y: y3 }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="40"
            y="40"
            width="120"
            height="120"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground/10"
            fill="none"
            transform="rotate(15 100 100)"
          />
          <rect
            x="60"
            y="60"
            width="80"
            height="80"
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground/5"
            fill="none"
            transform="rotate(15 100 100)"
          />
        </motion.svg>

        {/* SVG Shape 4 - Hexagon */}
        <motion.svg
          className="absolute top-1/3 right-1/3 w-40 h-40 md:w-60 md:h-60"
          style={{ y: y1 }}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent/15"
            fill="none"
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}
