export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const target = new Date(isoString);
  const diff = now - target;

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes}m`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h`;
  }
  if (diff < 7 * DAY) {
    const days = Math.floor(diff / DAY);
    return days === 1 ? 'Yesterday' : `${days}d`;
  }
  return target.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatLikes(count, liked) {
  const base = liked ? count + (count ? 1 : 1) : count;
  if (base >= 1_000_000) return `${(base / 1_000_000).toFixed(1)}M`;
  if (base >= 1_000) return `${(base / 1_000).toFixed(1)}K`;
  return base.toString();
}

export function truncateCaption(text, limit = 120) {
  if (!text || text.length <= limit) {
    return { short: text, long: '', truncated: false };
  }
  const short = text.slice(0, limit).trim();
  const rest = text.slice(limit).trim();
  return {
    short: short.endsWith('.') ? short : `${short}…`,
    long: rest,
    truncated: true,
  };
}
