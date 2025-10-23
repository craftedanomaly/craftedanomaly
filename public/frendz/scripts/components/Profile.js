export function createProfilePage({
  posts = [],
  likes,
  saved,
  onOpenPost,
}) {
  const container = document.createElement('section');
  container.className = 'h-full overflow-y-auto pb-24';

  const header = document.createElement('header');
  header.className = 'px-6 py-6 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800';

  const userInfo = document.createElement('div');
  userInfo.className = 'flex items-center gap-6 mb-6';
  userInfo.innerHTML = `
    <img src="/frendz/images/avatars/me.jpg" alt="Your profile" class="h-24 w-24 rounded-full object-cover border-4 border-slate-200 dark:border-slate-800" />
    <div class="flex-1">
      <h1 class="text-xl font-bold text-slate-900 dark:text-white mb-1">anomaly</h1>
      <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">Creative studio • Design & Games</p>
      <div class="flex gap-6 text-sm">
        <span class="text-slate-900 dark:text-white"><strong>${posts.length}</strong> posts</span>
        <span class="text-slate-900 dark:text-white"><strong>2.4K</strong> followers</span>
        <span class="text-slate-900 dark:text-white"><strong>842</strong> following</span>
      </div>
    </div>
  `;

  const actions = document.createElement('div');
  actions.className = 'flex gap-3';
  actions.innerHTML = `
    <button type="button" class="flex-1 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white active:scale-95 transition">Edit Profile</button>
    <button type="button" class="flex-1 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white active:scale-95 transition">Share Profile</button>
  `;

  const editButton = actions.querySelector('button:nth-child(1)');
  editButton.addEventListener('click', () => alert('Edit profile coming soon'));

  const shareButton = actions.querySelector('button:nth-child(2)');
  shareButton.addEventListener('click', () => alert('Share profile coming soon'));

  header.append(userInfo, actions);

  const tabs = document.createElement('nav');
  tabs.className = 'flex border-b border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10';
  tabs.innerHTML = `
    <button type="button" class="flex-1 py-3 text-sm font-semibold border-b-2 border-brand text-brand" data-tab="posts">
      <img src="/frendz/icons/grid.svg" alt="Posts" class="h-5 w-5 inline-block" />
    </button>
    <button type="button" class="flex-1 py-3 text-sm font-semibold border-b-2 border-transparent text-slate-500 dark:text-slate-400" data-tab="reels">
      <img src="/frendz/icons/reels.svg" alt="Reels" class="h-5 w-5 inline-block" />
    </button>
    <button type="button" class="flex-1 py-3 text-sm font-semibold border-b-2 border-transparent text-slate-500 dark:text-slate-400" data-tab="tagged">
      <img src="/frendz/icons/tag.svg" alt="Tagged" class="h-5 w-5 inline-block" />
    </button>
  `;

  const tabButtons = tabs.querySelectorAll('button');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      tabButtons.forEach((btn) => {
        btn.classList.remove('border-brand', 'text-brand');
        btn.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400');
      });
      button.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400');
      button.classList.add('border-brand', 'text-brand');

      if (tab === 'reels' || tab === 'tagged') {
        alert(`${tab.charAt(0).toUpperCase() + tab.slice(1)} coming soon`);
      }
    });
  });

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 gap-2 sm:gap-3 p-2 sm:p-4';

  if (posts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'col-span-3 py-24 text-center text-sm text-slate-500 dark:text-slate-400';
    empty.textContent = 'No posts yet. Share your first moment!';
    grid.appendChild(empty);
  } else {
    posts.slice(0, 4).forEach((post) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = [
        'relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-slate-800',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]'
      ].join(' ');

      const media = document.createElement(post.type === 'video' ? 'video' : 'img');
      media.className = 'absolute inset-0 w-full h-full object-cover';
      media.src = post.src;
      if (post.type === 'video') {
        media.muted = true;
        media.playsInline = true;
        media.loop = true;
        if (post.poster) media.poster = post.poster;
      } else {
        media.alt = post.caption ?? 'Post';
      }

      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-semibold';
      overlay.innerHTML = `
        <span class="inline-flex items-center gap-1">
          <img src="${likes?.get(post.id) ? '/frendz/icons/heart-filled.svg' : '/frendz/icons/heart.svg'}" alt="Likes" class="h-5 w-5" />
          ${post.likes}
        </span>
        <span class="inline-flex items-center gap-1">
          <img src="/frendz/icons/comment.svg" alt="Comments" class="h-5 w-5" />
          0
        </span>
      `;

      button.append(media, overlay);
      button.addEventListener('click', () => onOpenPost?.(post.id));

      grid.appendChild(button);
    });
  }

  container.append(header, tabs, grid);
  return container;
}
