/**
 * Video URL utilities for converting various video URLs to playable formats
 */

export function getPlayableVideoUrl(url: string): string {
  if (!url) return '';

  // Direct video files (MP4, WebM, etc.)
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return url;
  }

  // YouTube URLs
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    // For hover videos, we need direct MP4 - YouTube doesn't allow this
    // Return empty to show fallback message
    return '';
  }

  // Vimeo URLs
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    // For hover videos, we need direct MP4 - Vimeo doesn't allow this easily
    // Return empty to show fallback message
    return '';
  }

  // If it's already a direct URL, return as is
  return url;
}

export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) !== null;
}

export function getVideoType(url: string): 'direct' | 'youtube' | 'vimeo' | 'unknown' {
  if (!url) return 'unknown';

  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return 'direct';
  }

  if (url.match(/(?:youtube\.com|youtu\.be)/)) {
    return 'youtube';
  }

  if (url.match(/vimeo\.com/)) {
    return 'vimeo';
  }

  return 'unknown';
}

// Helpers to extract IDs and build embed URLs
function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const regex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export type EmbedKind = 'direct' | 'youtube' | 'vimeo' | 'unknown';

export function getEmbedInfo(url: string): { kind: EmbedKind; embedUrl?: string } {
  if (!url) return { kind: 'unknown' };
  if (isDirectVideoUrl(url)) return { kind: 'direct', embedUrl: url };

  const ytId = extractYouTubeId(url);
  if (ytId) {
    const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1`;
    return { kind: 'youtube', embedUrl };
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&muted=0&controls=0&dnt=1`;
    return { kind: 'vimeo', embedUrl };
  }

  return { kind: 'unknown' };
}
