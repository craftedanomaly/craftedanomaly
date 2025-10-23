const GRID_BREAKPOINTS = 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5';

export function createSearchPage({
  posts = [],
  likes,
  saved,
  muted,
  value = '',
  onSearchTermChange,
  onNavigate,
  onToggleMuted,
}) {
  const container = document.createElement('section');
  container.className = 'h-full flex flex-col';

  const header = document.createElement('div');
  header.className = 'px-4 py-4 sticky top-0 z-10 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200/60 dark:border-slate-800';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search posts or creators';
  input.value = value;
  input.className = 'w-full h-11 rounded-full bg-slate-100 dark:bg-slate-800/80 px-5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand';
  input.addEventListener('input', (event) => {
    const term = event.target.value;
    onSearchTermChange?.(term);
    renderGrid(term);
  });

  header.appendChild(input);

  const gridWrapper = document.createElement('div');
  gridWrapper.className = 'flex-1 overflow-y-auto px-1 pb-24';

  const grid = document.createElement('div');
  grid.className = `grid ${GRID_BREAKPOINTS} gap-[2px] sm:gap-2 pt-4`;

  gridWrapper.appendChild(grid);

  container.append(header, gridWrapper);

  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const media = entry.target;
      if (media.dataset.src) {
        media.src = media.dataset.src;
        media.removeAttribute('data-src');
      }
      if (media.tagName === 'VIDEO' && media.dataset.autoplay === 'true') {
        media.play().catch(() => {});
      }
      lazyObserver.unobserve(media);
    });
  }, {
    root: gridWrapper,
    rootMargin: '200px 0px',
    threshold: 0.1,
  });

  function createGridItem(post) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = [
      'relative aspect-square overflow-hidden rounded-[18px] sm:rounded-3xl bg-slate-200 dark:bg-slate-800 text-left',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950',
      'transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.97]'
    ].join(' ');

    let media;
    if (post.type === 'video') {
      media = document.createElement('video');
      media.className = 'absolute inset-0 w-full h-full object-cover';
      media.playsInline = true;
      media.loop = true;
      media.muted = muted;
      media.dataset.frendzVideo = 'true';
      media.dataset.autoplay = 'true';
      if (post.poster) media.poster = post.poster;
      media.dataset.src = post.src;

      media.addEventListener('mouseenter', () => {
        media.play().catch(() => {});
      });
      media.addEventListener('mouseleave', () => {
        if (muted) {
          media.pause();
          media.currentTime = 0;
        }
      });
      media.addEventListener('click', (event) => {
        event.stopPropagation();
        if (media.paused) {
          media.play().catch(() => {});
        } else {
          media.pause();
        }
      });
    } else {
      media = document.createElement('img');
      media.className = 'absolute inset-0 w-full h-full object-cover';
      media.alt = post.caption ?? 'Post';
      media.dataset.src = post.src;
    }

    lazyObserver.observe(media);

    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-150 flex items-end';

    const meta = document.createElement('div');
    meta.className = 'p-3 text-xs text-white flex w-full items-center justify-between';
    meta.innerHTML = `
      <span class="inline-flex items-center gap-1"><img src="./icons/heart.svg" alt="Likes" class="h-4 w-4" />${post.likes}</span>
      ${post.type === 'video' ? '<span class="inline-flex items-center gap-1"><img src="./icons/reels.svg" alt="Video" class="h-4 w-4" />Video</span>' : ''}
    `;

    overlay.appendChild(meta);

    button.append(media, overlay);
    button.addEventListener('click', () => {
      onNavigate?.(`#/post/${post.id}`);
    });

    return button;
  }

  function renderGrid(term = value) {
    grid.replaceChildren();
    const normalized = term.trim().toLowerCase();
    const filtered = normalized
      ? posts.filter((post) => {
          const haystack = [
            post.caption ?? '',
            post.user?.name ?? '',
            ...(post.tags ?? []),
          ].join(' ').toLowerCase();
          return haystack.includes(normalized);
        })
      : posts;

    if (filtered.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'col-span-full text-center text-sm text-slate-500 dark:text-slate-400 py-12';
      empty.textContent = 'No results. Try a different search.';
      grid.appendChild(empty);
      return;
    }

    filtered.forEach((post) => {
      const item = createGridItem(post);
      grid.appendChild(item);
    });
  }

  renderGrid(value);

  const cleanup = () => lazyObserver.disconnect();
  container.addEventListener('DOMNodeRemovedFromDocument', cleanup, { once: true });

  return container;
}
