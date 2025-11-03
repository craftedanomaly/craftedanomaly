/**
 * Global motion constants for consistent animations across the site
 * Aligned with the horizontal narrative visual language
 */

// Easing functions
export const EASING = {
  // Primary easing - smooth and elegant
  primary: [0.19, 1, 0.22, 1] as const,
  // Gentle easing for subtle movements
  gentle: [0.4, 0, 0.2, 1] as const,
  // Sharp easing for quick interactions
  sharp: [0.4, 0, 0.6, 1] as const,
  // Bounce for playful effects
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
} as const;

// Duration presets (in seconds)
export const DURATION = {
  instant: 0.15,
  fast: 0.3,
  normal: 0.52,
  slow: 0.75,
  slower: 1.0,
} as const;

// Spring configurations
export const SPRING = {
  // Gentle spring for smooth animations
  gentle: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 25,
    mass: 0.7,
  },
  // Bouncy spring for playful effects
  bouncy: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 15,
    mass: 0.5,
  },
  // Stiff spring for quick snaps
  stiff: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
} as const;

// Transition presets
export const TRANSITION = {
  primary: {
    duration: DURATION.normal,
    ease: EASING.primary,
  },
  fast: {
    duration: DURATION.fast,
    ease: EASING.primary,
  },
  slow: {
    duration: DURATION.slow,
    ease: EASING.primary,
  },
  gentle: {
    duration: DURATION.normal,
    ease: EASING.gentle,
  },
} as const;

// Framer Motion variants for common animations
export const VARIANTS = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  // Scale out (hero effect)
  scaleOut: {
    initial: { scale: 1, opacity: 1 },
    animate: { scale: 1, opacity: 1 },
    exit: { 
      scale: 1.1, 
      opacity: 0,
      filter: 'blur(8px)',
    },
  },
  // Slide from bottom
  slideUp: {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -60, opacity: 0 },
  },
  // Slide from right
  slideLeft: {
    initial: { x: 60, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  },
  // Modal overlay
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  // Modal content
  modalContent: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
} as const;

// Reduced motion check
export function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get transition with reduced motion support
export function getTransition(preset: keyof typeof TRANSITION = 'primary') {
  if (getPrefersReducedMotion()) {
    return { duration: 0.01 };
  }
  return TRANSITION[preset];
}

// Get variants with reduced motion support
export function getVariants<T extends keyof typeof VARIANTS>(
  variantKey: T,
  options?: {
    disableInitial?: boolean;
    disableExit?: boolean;
  }
) {
  const variant = VARIANTS[variantKey];
  const reducedMotion = getPrefersReducedMotion();

  if (reducedMotion) {
    return {
      initial: options?.disableInitial ? undefined : { opacity: 1 },
      animate: { opacity: 1 },
      exit: options?.disableExit ? undefined : { opacity: 1 },
    };
  }

  return {
    initial: options?.disableInitial ? undefined : variant.initial,
    animate: variant.animate,
    exit: options?.disableExit ? undefined : variant.exit,
  };
}
