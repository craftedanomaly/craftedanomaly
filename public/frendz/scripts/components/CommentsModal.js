// Placeholder yorumlar - bu listeyi değiştirebilirsiniz
const PLACEHOLDER_COMMENTS = [
  { user: 'charlie', avatar: './images/avatars/a2.jpg', text: 'Amazing work! 🔥' },
  { user: 'studio', avatar: './images/avatars/a3.jpg', text: 'Love the colors!' },
  { user: 'maya_creates', avatar: './images/avatars/a5.jpg', text: 'This is so inspiring ✨' },
  { user: 'pixel_art', avatar: './images/avatars/a4.jpg', text: 'Great composition!' },
  { user: 'designdaily', avatar: './images/avatars/a6.jpg', text: 'Can\'t wait to see more' },
  { user: 'urban_lens', avatar: './images/avatars/a8.jpg', text: 'Absolutely stunning 📸' },
  { user: 'sketch_daily', avatar: './images/avatars/a9.jpg', text: 'Keep up the great work!' },
  { user: 'codelife', avatar: './images/avatars/a7.jpg', text: 'This is fire! 🚀' },
];

function getRandomComments(postId) {
  const storageKey = `comments:${postId}`;
  const stored = localStorage.getItem(storageKey);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (err) {
      console.warn('Failed to parse stored comments', err);
    }
  }
  
  // Generate random number of placeholder comments (2-5)
  const count = Math.floor(Math.random() * 4) + 2;
  const shuffled = [...PLACEHOLDER_COMMENTS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count).map((comment, index) => ({
    id: `comment-${postId}-${index}`,
    user: comment.user,
    avatar: comment.avatar,
    text: comment.text,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }));
  
  localStorage.setItem(storageKey, JSON.stringify(selected));
  return selected;
}

function saveComments(postId, comments) {
  const storageKey = `comments:${postId}`;
  localStorage.setItem(storageKey, JSON.stringify(comments));
}

function formatCommentTime(isoString) {
  const now = new Date();
  const target = new Date(isoString);
  const diff = now - target;
  
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d`;
  return target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function mountCommentsModal({ post, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = [
    'fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center',
    'bg-black/70 backdrop-blur'
  ].join(' ');

  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.className = [
    'relative bg-white dark:bg-slate-900 w-full sm:max-w-lg sm:rounded-3xl shadow-2xl',
    'rounded-t-3xl sm:rounded-b-3xl max-h-[85vh] flex flex-col'
  ].join(' ');

  const header = document.createElement('header');
  header.className = 'px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800';
  header.innerHTML = `
    <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Comments</h2>
    <button type="button" class="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center" data-action="close">
      <img src="./icons/close.svg" alt="Close" class="h-5 w-5" />
    </button>
  `;

  const closeButton = header.querySelector('[data-action="close"]');
  closeButton.addEventListener('click', () => onClose?.());

  const commentsWrapper = document.createElement('div');
  commentsWrapper.className = 'flex-1 overflow-y-auto px-6 py-4 space-y-4';

  let comments = getRandomComments(post.id);

  function renderComments() {
    commentsWrapper.replaceChildren();
    
    if (comments.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'text-center text-sm text-slate-500 dark:text-slate-400 py-12';
      empty.textContent = 'No comments yet. Be the first to comment!';
      commentsWrapper.appendChild(empty);
      return;
    }

    comments.forEach((comment) => {
      const item = document.createElement('div');
      item.className = 'flex gap-3';
      item.innerHTML = `
        <img src="${comment.avatar}" alt="${comment.user}" class="h-10 w-10 rounded-full object-cover flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="bg-slate-100 dark:bg-slate-800/60 rounded-2xl px-4 py-2">
            <p class="text-sm font-semibold text-slate-900 dark:text-white">${comment.user}</p>
            <p class="text-sm text-slate-700 dark:text-slate-200 mt-1">${comment.text}</p>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-4">${formatCommentTime(comment.timestamp)}</p>
        </div>
      `;
      commentsWrapper.appendChild(item);
    });
  }

  const form = document.createElement('form');
  form.className = 'px-4 py-3 flex items-center gap-3 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur';
  form.innerHTML = `
    <img src="./images/avatars/me.jpg" alt="You" class="h-10 w-10 rounded-full object-cover flex-shrink-0" />
    <input type="text" placeholder="Add a comment..." class="flex-1 h-10 rounded-full bg-slate-100 dark:bg-slate-800 px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand" />
    <button type="submit" class="h-10 px-5 rounded-full bg-brand text-white font-semibold text-sm active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
      Post
    </button>
  `;

  const input = form.querySelector('input');
  const submitButton = form.querySelector('button[type="submit"]');

  input.addEventListener('input', () => {
    submitButton.disabled = !input.value.trim();
  });

  submitButton.disabled = true;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const newComment = {
      id: `comment-${post.id}-${Date.now()}`,
      user: 'anomaly',
      avatar: './images/avatars/me.jpg',
      text,
      timestamp: new Date().toISOString(),
    };

    comments = [...comments, newComment];
    saveComments(post.id, comments);
    input.value = '';
    submitButton.disabled = true;
    renderComments();
    
    // Scroll to bottom
    requestAnimationFrame(() => {
      commentsWrapper.scrollTop = commentsWrapper.scrollHeight;
    });
  });

  renderComments();

  dialog.append(header, commentsWrapper, form);
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
