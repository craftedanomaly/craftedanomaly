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
