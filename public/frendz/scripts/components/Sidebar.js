const NAV_ITEMS = [
  { id: '/home', label: 'Home', icon: '/frendz/icons/home.svg', hash: '#/home' },
  { id: '/search', label: 'Search', icon: '/frendz/icons/search.svg', hash: '#/search' },
  { id: '/messages', label: 'Messages', icon: '/frendz/icons/dm.svg', hash: '#/messages' },
  { id: '/create', label: 'Create', icon: '/frendz/icons/plus.svg', hash: '#/home' },
  { id: '/profile', label: 'Profile', icon: '/frendz/icons/profile.svg', hash: '#/profile' },
];

export function createSidebar({ current, onNavigate, onOpenCreate }) {
  const nav = document.createElement('nav');
  nav.className = 'flex flex-col gap-1';

  NAV_ITEMS.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    
    const isActive = item.id === current;
    
    button.className = [
      'flex items-center gap-4 px-3 py-3 rounded-lg transition text-left w-full',
      'hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
      isActive ? 'font-bold text-slate-900 dark:text-white' : 'font-normal text-slate-700 dark:text-slate-300'
    ].join(' ');

    button.innerHTML = `
      <img src="${item.icon}" alt="${item.label}" class="h-6 w-6 ${isActive ? 'opacity-100' : 'opacity-70'}" />
      <span class="text-base">${item.label}</span>
    `;

    if (item.id === '/create') {
      button.addEventListener('click', () => onOpenCreate?.());
    } else {
      button.addEventListener('click', () => onNavigate?.(item.hash));
    }

    nav.appendChild(button);
  });

  return nav;
}
