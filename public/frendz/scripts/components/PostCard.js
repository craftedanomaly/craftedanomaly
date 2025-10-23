import { formatRelativeTime, formatLikes, truncateCaption } from '../utils/format.js';

const DOUBLE_TAP_WINDOW = 280;

function createMedia({ post, muted, priority, onToggleMuted }) {
  if (post.type === 'video') {
    const video = document.createElement('video');
    video.className = 'w-full bg-black aspect-[4/5] object-cover';
    video.muted = muted;
    video.playsInline = true;
    video.loop = true;
    video.dataset.frendzVideo = 'true';
    video.dataset.autoplay = 'true';
    if (post.poster) {
      video.dataset.poster = post.poster;
      if (priority) {
        video.poster = post.poster;
      }
    }
    if (priority) {
      video.src = post.src;
      video.autoplay = true;
      video.play().catch(() => {});
    } else {
      video.dataset.src = post.src;
    }

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'absolute bottom-3 right-3 h-9 w-9 rounded-full bg-black/60 text-white flex items-center justify-center active:scale-95 transition';
    toggleButton.innerHTML = `<img src="${muted ? '/frendz/icons/muted.svg' : '/frendz/icons/volume.svg'}" alt="Toggle audio" class="h-4 w-4" />`;
    toggleButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const currentlyMuted = video.muted;
      video.muted = !currentlyMuted;
      toggleButton.innerHTML = `<img src="${video.muted ? '/frendz/icons/muted.svg' : '/frendz/icons/volume.svg'}" alt="Toggle audio" class="h-4 w-4" />`;
      onToggleMuted?.(video.muted);
      if (!video.muted) {
        video.play().catch(() => {});
      }
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'relative';
    wrapper.append(video, toggleButton);

    video.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    return { element: wrapper, target: video };
  }

  const image = document.createElement('img');
  image.className = 'w-full aspect-[4/5] object-cover bg-slate-200 dark:bg-slate-800';
  image.alt = post.caption ?? 'Post';

  if (priority) {
    image.src = post.src;
  } else {
    image.dataset.src = post.src;
  }

  return { element: image, target: image };
}

export function createPostCard({
  post,
  liked,
  saved,
  muted,
  priority = false,
  onToggleLike,
  onToggleSave,
  onOpenComments,
  onOpenProfile,
  onOpenPost,
}) {
  const card = document.createElement('article');
  card.className = 'bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl shadow-sm mx-4';

  const header = document.createElement('header');
  header.className = 'flex items-center justify-between px-4 py-3';

  const userButton = document.createElement('button');
  userButton.type = 'button';
  userButton.className = 'flex items-center gap-3 active:scale-95 transition focus:outline-none';
  userButton.innerHTML = `
    <img src="${post.user?.avatar ?? '/frendz/images/avatars/placeholder.jpg'}" alt="${post.user?.name ?? 'User'}" class="h-10 w-10 rounded-full object-cover" />
    <div class="text-left">
      <p class="text-sm font-semibold text-slate-900 dark:text-white">${post.user?.name ?? 'Unknown'}</p>
      <p class="text-xs text-slate-500 dark:text-slate-400">${formatRelativeTime(post.time)}</p>
    </div>
  `;

  userButton.addEventListener('click', () => onOpenProfile?.(post.user?.id));

  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.className = 'p-2 rounded-full active:scale-95 transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-200';
  menuButton.innerHTML = '<img src="/frendz/icons/more.svg" alt="More options" class="h-5 w-5" />';
  menuButton.addEventListener('click', () => alert('Options coming soon'));

  header.append(userButton, menuButton);

  const { element: mediaElement, target: lazyTarget } = createMedia({ post, muted, priority, onToggleMuted: () => {} });

  const likeButton = document.createElement('button');
  likeButton.type = 'button';
  likeButton.className = 'h-9 w-9 flex items-center justify-center rounded-full active:scale-95 transition';
  likeButton.innerHTML = `<img src="${liked ? '/frendz/icons/heart-filled.svg' : '/frendz/icons/heart.svg'}" alt="Like" class="h-6 w-6" />`;

  likeButton.addEventListener('click', () => {
    onToggleLike?.();
  });

  const commentButton = document.createElement('button');
  commentButton.type = 'button';
  commentButton.className = 'h-9 w-9 flex items-center justify-center rounded-full active:scale-95 transition';
  commentButton.innerHTML = '<img src="/frendz/icons/comment.svg" alt="Comments" class="h-6 w-6" />';
  commentButton.addEventListener('click', () => onOpenComments?.());

  const shareButton = document.createElement('button');
  shareButton.type = 'button';
  shareButton.className = 'h-9 w-9 flex items-center justify-center rounded-full active:scale-95 transition';
  shareButton.innerHTML = '<img src="/frendz/icons/share.svg" alt="Share" class="h-6 w-6" />';
  shareButton.addEventListener('click', () => alert('Share coming soon'));

  const actionsLeft = document.createElement('div');
  actionsLeft.className = 'flex items-center gap-1';
  actionsLeft.append(likeButton, commentButton, shareButton);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'h-9 w-9 flex items-center justify-center rounded-full active:scale-95 transition';
  saveButton.innerHTML = `<img src="${saved ? '/frendz/icons/save-filled.svg' : '/frendz/icons/save.svg'}" alt="Save" class="h-6 w-6" />`;
  saveButton.addEventListener('click', () => onToggleSave?.());

  const actions = document.createElement('div');
  actions.className = 'flex items-center justify-between px-4 py-3';
  actions.append(actionsLeft, saveButton);

  const likesLabel = document.createElement('p');
  likesLabel.className = 'px-4 text-sm font-semibold text-slate-900 dark:text-white';
  likesLabel.textContent = `${formatLikes(post.likes, liked)} likes`;

  const captionWrapper = document.createElement('div');
  captionWrapper.className = 'px-4 pb-3 text-sm text-slate-700 dark:text-slate-200 space-y-1';

  const caption = truncateCaption(post.caption, 120);
  const captionText = document.createElement('p');
  captionText.innerHTML = `<span class="font-semibold mr-2">${post.user?.name ?? 'Unknown'}</span>${caption.truncated ? caption.short : caption.short ?? ''}`;
  captionWrapper.appendChild(captionText);

  if (caption.truncated) {
    const moreButton = document.createElement('button');
    moreButton.type = 'button';
    moreButton.className = 'text-xs font-medium text-slate-500 dark:text-slate-400';
    moreButton.textContent = 'more';
    moreButton.addEventListener('click', () => {
      captionText.textContent = `${post.user?.name ?? 'Unknown'} ${post.caption}`;
      captionText.classList.add('font-normal');
      moreButton.remove();
    });
    captionWrapper.appendChild(moreButton);
  }

  const timeLabel = document.createElement('p');
  timeLabel.className = 'px-4 pb-4 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500';
  timeLabel.textContent = formatRelativeTime(post.time);

  const heartOverlay = document.createElement('span');
  heartOverlay.className = 'pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-0';
  heartOverlay.innerHTML = '<img src="/frendz/icons/heart-filled.svg" alt="Liked" class="h-20 w-20 text-white drop-shadow-lg" />';

  const mediaWrapper = document.createElement('div');
  mediaWrapper.className = 'relative';
  mediaWrapper.append(mediaElement, heartOverlay);

  let lastTap = 0;
  mediaWrapper.addEventListener('click', () => onOpenPost?.());

  mediaWrapper.addEventListener('pointerdown', () => {
    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP_WINDOW) {
      heartOverlay.classList.remove('heart-burst');
      heartOverlay.classList.add('opacity-100');
      void heartOverlay.offsetWidth;
      heartOverlay.classList.add('heart-burst');
      onToggleLike?.();
      setTimeout(() => heartOverlay.classList.remove('opacity-100'), 450);
    }
    lastTap = now;
  });

  card.append(header, mediaWrapper, actions, likesLabel, captionWrapper, timeLabel);

  return {
    element: card,
    lazyTargets: lazyTarget ? [lazyTarget] : [],
  };
}
