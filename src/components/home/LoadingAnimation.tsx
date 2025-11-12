"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Dynamically import ldrs
if (typeof window !== "undefined") {
  import("ldrs").then((ldrs) => {
    ldrs.mirage.register();
  });
}

interface LoadingAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

export function LoadingAnimation({
  isActive,
  onComplete,
}: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!onComplete) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <>
      {isActive && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              {/* @ts-ignore */}
              <l-mirage size="150" speed="2.5" color="#ed5c2c" />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
