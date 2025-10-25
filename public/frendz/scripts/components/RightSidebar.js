const SUGGESTED_USERS = [
  { id: 'u2', name: 'charlie', avatar: '/frendz/images/avatars/a2.jpg', subtitle: 'Followed by anomaly' },
  { id: 'u4', name: 'pixel_art', avatar: '/frendz/images/avatars/a4.jpg', subtitle: 'Followed by studio' },
  { id: 'u5', name: 'maya_creates', avatar: '/frendz/images/avatars/a5.jpg', subtitle: 'Followed by charlie' },
  { id: 'u6', name: 'designdaily', avatar: '/frendz/images/avatars/a6.jpg', subtitle: 'New to Frendz' },
  { id: 'u9', name: 'sketch_daily', avatar: '/frendz/images/avatars/a9.jpg', subtitle: 'Followed by maya_creates' },
];

export function createRightSidebar({ onNavigate }) {
  const container = document.createElement('aside');
  container.className = 'hidden xl:block xl:w-80 xl:fixed xl:right-0 xl:top-0 xl:h-full xl:overflow-y-auto xl:pt-8 xl:px-8';

  // Current user profile
  const currentUser = document.createElement('div');
  currentUser.className = 'flex items-center gap-3 mb-6';
  currentUser.innerHTML = `
    <img src="/frendz/images/avatars/me.jpg" alt="You" class="h-14 w-14 rounded-full object-cover" />
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">anomaly</p>
      <p class="text-xs text-slate-500 dark:text-slate-400 truncate">Your profile</p>
    </div>
    <button type="button" class="text-xs font-semibold text-brand hover:text-brand-dark transition">Switch</button>
  `;

  // Suggestions header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-4';
  header.innerHTML = `
    <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400">Suggested for you</h2>
    <button type="button" class="text-xs font-semibold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300">See All</button>
  `;

  // Suggestions list
  const list = document.createElement('div');
  list.className = 'space-y-3';

  SUGGESTED_USERS.forEach((user) => {
    const item = document.createElement('div');
    item.className = 'flex items-center gap-3';
    
    const userInfo = document.createElement('button');
    userInfo.type = 'button';
    userInfo.className = 'flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition';
    userInfo.innerHTML = `
      <img src="${user.avatar}" alt="${user.name}" class="h-10 w-10 rounded-full object-cover" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">${user.name}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${user.subtitle}</p>
      </div>
    `;
    userInfo.addEventListener('click', () => {
      onNavigate?.(`#/profile`);
    });

    const followBtn = document.createElement('button');
    followBtn.type = 'button';
    followBtn.className = 'text-xs font-semibold text-brand hover:text-brand-dark transition';
    followBtn.textContent = 'Follow';
    followBtn.addEventListener('click', () => {
      followBtn.textContent = 'Following';
      followBtn.className = 'text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition';
    });

    item.append(userInfo, followBtn);
    list.appendChild(item);
  });

  // Footer
  const footer = document.createElement('footer');
  footer.className = 'mt-8 text-xs text-slate-400 dark:text-slate-500 space-y-2';
  footer.innerHTML = `
    <p>© 2025 FRENDZ FROM CRAFTEDANOMALY</p>
  `;

  container.append(currentUser, header, list, footer);
  return container;
}
