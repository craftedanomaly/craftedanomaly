// "use client";

// import { useEffect, useState } from 'react';
// import { motion, useScroll, useSpring } from 'framer-motion';
// import { getPrefersReducedMotion } from '@/lib/motion-constants';

// export function ScrollProgress() {
//   const [isVisible, setIsVisible] = useState(false);
//   const { scrollYProgress } = useScroll();
//   const scaleX = useSpring(scrollYProgress, {
//     stiffness: 100,
//     damping: 30,
//     restDelta: 0.001
//   });

//   // Show progress bar only after scrolling a bit
//   useEffect(() => {
//     const unsubscribe = scrollYProgress.on('change', (latest) => {
//       setIsVisible(latest > 0.05);
//     });
//     return () => unsubscribe();
//   }, [scrollYProgress]);

//   const reducedMotion = getPrefersReducedMotion();

//   if (reducedMotion) {
//     return null; // Don't show in reduced motion mode
//   }

//   return (
//     <motion.div
//       className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[100] origin-left"
//       style={{ scaleX, opacity: isVisible ? 1 : 0 }}
//       transition={{ opacity: { duration: 0.2 } }}
//     />
//   );
// }

"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import Lenis from "lenis";

interface ScrollProgressProps {
  children: ReactNode;
}

const SmoothScrollerContext = createContext({});

export const useSmoothScroller = () => useContext(SmoothScrollerContext);

export default function ScrollProgress({ children }: ScrollProgressProps) {
  const [lenisRef, setLenis] = useState<any>(null);
  const [rafState, setRaf] = useState<any>(null);

  useEffect(() => {
    const scroller = new Lenis({
      duration: 0.6,
    });
    let rf: any;
    function raf(time: any) {
      scroller.raf(time);
      requestAnimationFrame(raf);
    }

    rf = requestAnimationFrame(raf);
    setRaf(rf);
    setLenis(scroller);

    return () => {
      if (lenisRef) {
        cancelAnimationFrame(rafState);
        lenisRef.destroy();
      }
    };
  }, []);

  return (
    <SmoothScrollerContext.Provider value={lenisRef}>
      {children}
    </SmoothScrollerContext.Provider>
  );
}
