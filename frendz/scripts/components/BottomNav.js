const NAV_ITEMS = [
  { id: '/home', label: 'Home', icon: '/icons/home.svg', hash: '#/home' },
  { id: '/search', label: 'Search', icon: '/icons/search.svg', hash: '#/search' },
  { id: '/create', label: 'Create', icon: '/icons/plus.svg', hash: '#/home' },
  { id: '/reels', label: 'Reels', icon: '/icons/reels.svg', hash: '#/home' },
  { id: '/profile', label: 'Profile', icon: '/icons/profile.svg', hash: '#/profile' },
];

export function createBottomNav({ current, onNavigate, onOpenCreate }) {
  const nav = document.createElement('nav');
  nav.className = 'px-2 sm:px-8 py-2 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400';

  NAV_ITEMS.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = [
      'flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition',
      'active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
    ].join(' ');

    const isActive = item.id === current;

    button.innerHTML = `
      <span class="relative inline-flex">
        <img src="${item.icon}" alt="${item.label}" class="h-5 w-5 ${isActive ? 'opacity-100' : 'opacity-70'}" />
        ${isActive ? '<span class="absolute inset-0 rounded-full ring-2 ring-brand/80 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 pointer-events-none"></span>' : ''}
      </span>
      <span class="text-[11px] font-medium">${item.label}</span>
    `;

    if (item.id === '/create') {
      button.addEventListener('click', () => onOpenCreate?.());
    } else if (item.id === '/reels') {
      button.addEventListener('click', () => alert('Reels coming soon ✨'));
    } else {
      button.addEventListener('click', () => onNavigate?.(item.hash));
    }

    nav.appendChild(button);
  });

  return nav;
}
