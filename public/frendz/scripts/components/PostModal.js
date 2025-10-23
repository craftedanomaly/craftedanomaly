import { formatLikes, formatRelativeTime } from '../utils/format.js';

export function mountPostModal({
  post,
  liked,
  saved,
  muted,
  onToggleLike,
  onToggleSave,
  onClose,
}) {
  const overlay = document.createElement('div');
  overlay.className = [
    'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10',
    'bg-black/70 backdrop-blur'
  ].join(' ');

  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.className = 'relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl grid grid-cols-1 md:grid-cols-[3fr_2fr]';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'absolute top-4 right-4 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur';
  closeButton.innerHTML = '<img src="./icons/close.svg" alt="Close" class="h-5 w-5" />';
  closeButton.addEventListener('click', () => onClose?.());

  const mediaWrapper = document.createElement('div');
  mediaWrapper.className = 'bg-black flex items-center justify-center';

  if (post.type === 'video') {
    const video = document.createElement('video');
    video.src = post.src;
    video.poster = post.poster ?? '';
    video.className = 'w-full h-full object-contain';
    video.controls = true;
    video.muted = muted;
    video.playsInline = true;
    video.dataset.frendzVideo = 'true';
    mediaWrapper.appendChild(video);
  } else {
    const image = document.createElement('img');
    image.src = post.src;
    image.alt = post.caption ?? 'Post';
    image.className = 'w-full h-full object-contain bg-black';
    mediaWrapper.appendChild(image);
  }

  const aside = document.createElement('div');
  aside.className = 'flex flex-col';

  const header = document.createElement('header');
  header.className = 'flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800';
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <img src="${post.user?.avatar ?? './images/avatars/placeholder.jpg'}" alt="${post.user?.name ?? 'User'}" class="h-10 w-10 rounded-full object-cover" />
      <div>
        <p class="text-sm font-semibold text-slate-900 dark:text-white">${post.user?.name ?? 'Unknown'}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">${formatRelativeTime(post.time)}</p>
      </div>
    </div>
    <button type="button" class="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
      <img src="./icons/more.svg" alt="Options" class="h-5 w-5" />
    </button>
  `;

  const actions = document.createElement('div');
  actions.className = 'flex items-center justify-between px-5 py-3 border-t border-b border-slate-200 dark:border-slate-800';
  const leftActions = document.createElement('div');
  leftActions.className = 'flex items-center gap-2';

  const likeButton = document.createElement('button');
  likeButton.type = 'button';
  likeButton.className = 'h-10 w-10 rounded-full flex items-center justify-center active:scale-95 transition';
  likeButton.innerHTML = `<img src="${liked ? './icons/heart-filled.svg' : './icons/heart.svg'}" alt="Like" class="h-6 w-6" />`;
  likeButton.addEventListener('click', () => onToggleLike?.());

  const commentButton = document.createElement('button');
  commentButton.type = 'button';
  commentButton.className = 'h-10 w-10 rounded-full flex items-center justify-center active:scale-95 transition';
  commentButton.innerHTML = '<img src="./icons/comment.svg" alt="Comments" class="h-6 w-6" />';
  commentButton.addEventListener('click', () => alert('Comments coming soon'));

  const shareButton = document.createElement('button');
  shareButton.type = 'button';
  shareButton.className = 'h-10 w-10 rounded-full flex items-center justify-center active:scale-95 transition';
  shareButton.innerHTML = '<img src="./icons/share.svg" alt="Share" class="h-6 w-6" />';
  shareButton.addEventListener('click', () => alert('Share coming soon'));

  leftActions.append(likeButton, commentButton, shareButton);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'h-10 w-10 rounded-full flex items-center justify-center active:scale-95 transition';
  saveButton.innerHTML = `<img src="${saved ? './icons/save-filled.svg' : './icons/save.svg'}" alt="Save" class="h-6 w-6" />`;
  saveButton.addEventListener('click', () => onToggleSave?.());

  actions.append(leftActions, saveButton);

  const likesLabel = document.createElement('p');
  likesLabel.className = 'px-5 py-2 text-sm font-semibold text-slate-900 dark:text-white';
  likesLabel.textContent = `${formatLikes(post.likes, liked)} likes`;

  const caption = document.createElement('div');
  caption.className = 'px-5 py-3 text-sm text-slate-700 dark:text-slate-200 overflow-y-auto max-h-60';
  caption.innerHTML = `<span class="font-semibold mr-2">${post.user?.name ?? 'Unknown'}</span>${post.caption ?? ''}`;

  const footer = document.createElement('div');
  footer.className = 'px-5 py-3 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800';
  footer.textContent = formatRelativeTime(post.time);

  aside.append(header, actions, likesLabel, caption, footer);
  dialog.append(closeButton, mediaWrapper, aside);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  function handleKey(event) {
    if (event.key === 'Escape') {
      onClose?.();
    }
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      onClose?.();
    }
  });

  window.addEventListener('keydown', handleKey);

  const destroy = () => {
    window.removeEventListener('keydown', handleKey);
    overlay.remove();
  };

  return { destroy };
}
