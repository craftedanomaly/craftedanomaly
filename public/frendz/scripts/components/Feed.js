import { createPostCard } from './PostCard.js';

export function createFeed({
  posts = [],
  likes,
  saved,
  muted,
  onToggleLike,
  onToggleSave,
  onOpenComments,
  onOpenProfile,
  onOpenPost,
  onToggleMuted,
}) {
  const container = document.createElement('section');
  container.className = 'flex flex-col gap-4 pt-4 pb-24 px-4 lg:px-0 lg:max-w-[470px] lg:mx-auto';

  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const src = target.dataset.src;
      if (src) {
        if (target.tagName === 'VIDEO') {
          target.src = src;
          const poster = target.dataset.poster;
          if (poster) target.poster = poster;
          if (target.dataset.autoplay === 'true') {
            target.play().catch(() => {});
          }
        } else {
          target.src = src;
        }
        target.removeAttribute('data-src');
      }
      lazyObserver.unobserve(target);
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0.01,
  });

  posts.forEach((post, index) => {
    const postCard = createPostCard({
      post,
      liked: !!likes?.get(post.id),
      saved: !!saved?.get(post.id),
      muted,
      priority: index < 4,
      onToggleLike: () => onToggleLike?.(post.id),
      onToggleSave: () => onToggleSave?.(post.id),
      onOpenComments: () => onOpenComments?.(post.id),
      onOpenProfile: () => onOpenProfile?.(post.user?.id),
      onOpenPost: () => onOpenPost?.(post.id),
      onToggleMuted,
    });
    postCard.lazyTargets.forEach((target) => lazyObserver.observe(target));
    container.appendChild(postCard.element);
  });

  const cleanup = () => lazyObserver.disconnect();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === container) {
          cleanup();
          observer.disconnect();
        }
      });
    });
  });

  if (container.parentNode) {
    observer.observe(container.parentNode, { childList: true });
  } else {
    queueMicrotask(() => {
      if (container.parentNode) {
        observer.observe(container.parentNode, { childList: true });
      }
    });
  }

  return container;
}
