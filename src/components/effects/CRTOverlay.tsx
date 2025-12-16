'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebGLCRT } from './WebGLCRT';

export function CRTOverlay() {
  const [crtEnabled, setCrtEnabled] = useState(true);

  return (
    <>
      {/* Control Panel - Top Right */}
      <div className="fixed top-6 right-24 z-[9999] flex gap-2">
        <button
          onClick={() => setCrtEnabled(!crtEnabled)}
          className="px-3 py-1.5 text-xs font-medium bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-black/80 transition-colors"
          title="Toggle CRT Effect"
        >
          {crtEnabled ? '📺 ON' : '📺 OFF'}
        </button>
      </div>

      {/* WebGL CRT Effect */}
      <WebGLCRT enabled={crtEnabled} />

      {/* CRT Effect */}
      <AnimatePresence>
        {crtEnabled && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[9998] crt-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Interlacing (Scanlines) */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  repeating-linear-gradient(
                    0deg,
                    rgba(0, 0, 0, 0) 0px,
                    rgba(0, 0, 0, 0.3) 1px,
                    rgba(0, 0, 0, 0) 2px
                  )
                `,
                backgroundSize: '100% 2px',
              }}
            />
            
            {/* Moving Scanline */}
            <div
              className="absolute inset-0 animate-scanline"
              style={{
                background: 'linear-gradient(transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
                backgroundSize: '100% 200px',
              }}
            />
            
            {/* Vignette (stronger) */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.6) 100%)',
                boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.5)',
              }}
            />
            
            {/* Screen Flicker */}
            <div
              className="absolute inset-0 animate-flicker"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                mixBlendMode: 'overlay',
              }}
            />
            
            {/* RGB Shift */}
            <div
              className="absolute inset-0 animate-rgb-shift"
              style={{
                background: 'linear-gradient(90deg, rgba(255,0,0,0.02) 0%, rgba(0,255,0,0.02) 50%, rgba(0,0,255,0.02) 100%)',
                mixBlendMode: 'screen',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
