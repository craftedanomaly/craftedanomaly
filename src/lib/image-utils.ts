// Generate a simple blur placeholder for images
export function generateBlurPlaceholder(width: number = 8, height: number = 8): string {
  // Create a simple gradient placeholder and encode as UTF-8 data URI (no Buffer required)
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#151517;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0b0b0c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#151517;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generate a shimmer placeholder for loading states
export function generateShimmerPlaceholder(width: number = 400, height: number = 300): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#151517;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1a1a1c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#151517;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#shimmer)" />
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Optimized image props for Next.js Image component
export function getOptimizedImageProps(src: string, alt: string, priority: boolean = false) {
  return {
    src,
    alt,
    placeholder: 'blur' as const,
    blurDataURL: generateBlurPlaceholder(),
    priority,
    quality: 85, // Good balance between quality and file size
    loading: priority ? ('eager' as const) : ('lazy' as const),
  };
}

// Get responsive sizes for different use cases
export const imageSizes = {
  hero: '100vw',
  card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  gallery: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw',
  avatar: '(max-width: 768px) 64px, 96px',
  thumbnail: '(max-width: 768px) 150px, 200px',
  fullWidth: '100vw',
  halfWidth: '50vw',
  categorySlice: '(max-width: 768px) 100vw, 14vw',
} as const;
