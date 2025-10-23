function getAdjacentStories(stories, currentId) {
  const index = stories.findIndex((story) => story.id === currentId);
  if (index === -1) return { prev: null, next: null };
  const prev = stories[index - 1]?.id ?? null;
  const next = stories[index + 1]?.id ?? null;
  return { prev, next };
}

export function mountStoryViewer({
  story,
  stories = [],
  seen = false,
  muted = true,
  onSeen,
  onClose,
  onNextStory,
  onPrevStory,
  onToggleMuted,
}) {
  const overlay = document.createElement('div');
  overlay.className = [
    'fixed inset-0 z-50 bg-black/90 backdrop-blur-sm text-white',
    'flex flex-col justify-center items-center p-4 sm:p-6'
  ].join(' ');

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'relative max-w-sm w-full aspect-[9/16] bg-black/80 rounded-3xl overflow-hidden shadow-2xl border border-white/10';

  const progressWrapper = document.createElement('div');
  progressWrapper.className = 'absolute top-4 left-4 right-4 flex gap-1 z-20';

  const header = document.createElement('header');
  header.className = 'absolute top-10 left-4 right-4 z-20 flex items-center justify-between';
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <img src="${story.user?.avatar ?? '/images/avatars/placeholder.jpg'}" alt="${story.user?.name ?? 'User'}" class="h-10 w-10 rounded-full object-cover border-2 border-white/30" />
      <div>
        <p class="text-sm font-semibold">${story.user?.name ?? 'Unknown'}</p>
        <p class="text-xs text-white/70">${seen ? 'Viewed' : 'Just now'}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" class="h-9 w-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center active:scale-95 transition" data-action="mute">
        <img src="${muted ? '/icons/muted.svg' : '/icons/volume.svg'}" alt="Toggle audio" class="h-4 w-4" />
      </button>
      <button type="button" class="h-9 w-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center active:scale-95 transition" data-action="close">
        <img src="/icons/close.svg" alt="Close" class="h-4 w-4" />
      </button>
    </div>
  `;

  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'w-full h-full relative flex items-center justify-center';

  const prevZone = document.createElement('button');
  prevZone.type = 'button';
  prevZone.className = 'absolute inset-y-0 left-0 w-1/3 z-10';
  prevZone.setAttribute('aria-label', 'Previous story');
  const nextZone = document.createElement('button');
  nextZone.type = 'button';
  nextZone.className = 'absolute inset-y-0 right-0 w-1/3 z-10';
  nextZone.setAttribute('aria-label', 'Next story');

  const holdLayer = document.createElement('div');
  holdLayer.className = 'absolute inset-0 z-5';

  const { prev: prevStoryId, next: nextStoryId } = getAdjacentStories(stories, story.id);

  let currentIndex = 0;
  let isPaused = false;
  let progressFrame = null;
  let progressStart = 0;
  let currentDuration = 0;
  let currentMedia = null;
  let progressBars = [];
  let elapsed = 0;
  let lastTick = 0;

  function cleanupMedia() {
    if (currentMedia) {
      if (currentMedia.tagName === 'VIDEO') {
        currentMedia.pause();
        currentMedia.src = '';
        currentMedia.load();
      }
      currentMedia.remove();
      currentMedia = null;
    }
  }

  function setProgress(index, value) {
    progressBars[index].style.width = `${Math.min(100, Math.max(0, value * 100))}%`;
  }

  function fillPrevious(index) {
    for (let i = 0; i < progressBars.length; i += 1) {
      progressBars[i].style.width = i < index ? '100%' : '0%';
    }
  }

  function playSegment(index) {
    const item = story.items[index];
    if (!item) {
      if (nextStoryId) {
        onNextStory?.(nextStoryId);
      } else {
        onClose?.();
      }
      return;
    }

    fillPrevious(index);
    setProgress(index, 0);

    cancelAnimationFrame(progressFrame);
    progressFrame = null;
    cleanupMedia();
    const wrapper = document.createElement(item.type === 'video' ? 'video' : 'img');
    wrapper.className = 'max-w-full max-h-full object-cover w-full h-full';

    if (item.type === 'image') {
      wrapper.src = item.src;
      wrapper.alt = `${story.user?.name ?? 'Story'} story`;
    } else {
      wrapper.src = item.src;
      if (item.poster) wrapper.poster = item.poster;
      wrapper.muted = muted;
      wrapper.playsInline = true;
      wrapper.autoplay = item.autoplay !== false;
      wrapper.loop = false;
      wrapper.controls = false;
      wrapper.dataset.frendzVideo = 'true';
      wrapper.addEventListener('ended', () => {
        if (!isPaused) {
          nextSegment();
        }
      });
      if (wrapper.autoplay) {
        wrapper.play().catch(() => {});
      }
    }

    currentMedia = wrapper;
    mediaContainer.appendChild(wrapper);
    currentDuration = item.duration ?? (item.type === 'video' ? (wrapper.duration ? wrapper.duration * 1000 : 7000) : 5000);
    elapsed = 0;
    lastTick = performance.now();

    if (!seen) {
      onSeen?.();
      seen = true;
    }

    stepProgress();
  }

  function stepProgress(now = performance.now()) {
    if (!progressBars[currentIndex]) {
      return;
    }
    if (isPaused) {
      lastTick = now;
      progressFrame = requestAnimationFrame(stepProgress);
      return;
    }
    elapsed += now - lastTick;
    lastTick = now;
    const ratio = elapsed / currentDuration;
    setProgress(currentIndex, ratio);
    if (ratio >= 1) {
      cancelAnimationFrame(progressFrame);
      progressFrame = null;
      nextSegment();
      return;
    }
    progressFrame = requestAnimationFrame(stepProgress);
  }

  function nextSegment() {
    currentIndex += 1;
    if (currentIndex >= story.items.length) {
      if (nextStoryId) {
        onNextStory?.(nextStoryId);
      } else {
        onClose?.();
      }
      return;
    }
    playSegment(currentIndex);
  }

  function prevSegment() {
    currentIndex -= 1;
    if (currentIndex < 0) {
      if (prevStoryId) {
        onPrevStory?.(prevStoryId);
      } else {
        currentIndex = 0;
        setProgress(0, 0);
      }
      return;
    }
    playSegment(currentIndex);
  }

  function togglePause(state) {
    if (isPaused === state) return;
    isPaused = state;
    if (currentMedia && currentMedia.tagName === 'VIDEO') {
      if (state) {
        currentMedia.pause();
      } else if (currentMedia.paused) {
        currentMedia.play().catch(() => {});
      }
    }
    if (!state) {
      lastTick = performance.now();
    }
  }

  prevZone.addEventListener('click', (event) => {
    event.stopPropagation();
    prevSegment();
  });

  nextZone.addEventListener('click', (event) => {
    event.stopPropagation();
    nextSegment();
  });

  holdLayer.addEventListener('pointerdown', () => togglePause(true));
  holdLayer.addEventListener('pointerup', () => togglePause(false));
  holdLayer.addEventListener('pointerleave', () => togglePause(false));

  const closeButton = header.querySelector('[data-action="close"]');
  closeButton.addEventListener('click', () => onClose?.());

  const muteButton = header.querySelector('[data-action="mute"]');
  muteButton.addEventListener('click', () => {
    muted = !muted;
    muteButton.innerHTML = `<img src="${muted ? '/icons/muted.svg' : '/icons/volume.svg'}" alt="Toggle audio" class="h-4 w-4" />`;
    if (currentMedia && currentMedia.tagName === 'VIDEO') {
      currentMedia.muted = muted;
      if (!muted) {
        currentMedia.play().catch(() => {});
      }
    }
    onToggleMuted?.(muted);
  });

  function handleKey(event) {
    if (event.key === 'Escape') {
      onClose?.();
    } else if (event.key === 'ArrowRight') {
      nextSegment();
    } else if (event.key === 'ArrowLeft') {
      prevSegment();
    }
  }

  window.addEventListener('keydown', handleKey);

  progressBars = story.items.map(() => {
    const track = document.createElement('div');
    track.className = 'flex-1 h-1 bg-white/30 rounded-full overflow-hidden';
    const bar = document.createElement('div');
    bar.className = 'h-full w-0 bg-white transition-[width] duration-200 ease-linear';
    track.appendChild(bar);
    progressWrapper.appendChild(track);
    return bar;
  });

  contentWrapper.append(progressWrapper, header, mediaContainer, prevZone, nextZone, holdLayer);
  overlay.appendChild(contentWrapper);
  document.body.appendChild(overlay);

  playSegment(currentIndex);

  const destroy = () => {
    cancelAnimationFrame(progressFrame);
    cleanupMedia();
    overlay.remove();
    window.removeEventListener('keydown', handleKey);
  };

  return { destroy };
}
