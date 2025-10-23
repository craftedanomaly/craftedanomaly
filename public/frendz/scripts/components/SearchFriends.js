// Örnek kullanıcı verileri - bu listeyi değiştirebilirsiniz
const SAMPLE_USERS = [
  { id: 'u1', name: 'anomaly', avatar: '/frendz/images/avatars/a1.jpg' },
  { id: 'u2', name: 'charlie', avatar: '/frendz/images/avatars/a2.jpg' },
  { id: 'u3', name: 'studio', avatar: '/frendz/images/avatars/a3.jpg' },
  { id: 'u4', name: 'pixel_art', avatar: '/frendz/images/avatars/a4.jpg' },
  { id: 'u5', name: 'maya_creates', avatar: '/frendz/images/avatars/a5.jpg' },
  { id: 'u6', name: 'designdaily', avatar: '/frendz/images/avatars/a6.jpg' },
  { id: 'u7', name: 'codelife', avatar: '/frendz/images/avatars/a7.jpg' },
  { id: 'u8', name: 'urban_lens', avatar: '/frendz/images/avatars/a8.jpg' },
  { id: 'u9', name: 'sketch_daily', avatar: '/frendz/images/avatars/a9.jpg' },
  { id: 'u10', name: 'minimal_studio', avatar: '/frendz/images/avatars/a10.jpg' },
];

export function createSearchPage({ value = '', onNavigate }) {
  const container = document.createElement('section');
  container.className = 'h-full flex flex-col bg-slate-50 dark:bg-slate-950';

  const header = document.createElement('div');
  header.className = 'px-4 py-4 sticky top-0 z-10 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200/60 dark:border-slate-800';

  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search friends...';
  input.value = value;
  input.className = 'w-full h-11 rounded-full bg-slate-100 dark:bg-slate-800/80 px-5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand';

  header.appendChild(input);

  const resultsWrapper = document.createElement('div');
  resultsWrapper.className = 'flex-1 overflow-y-auto px-4 pb-24';

  const title = document.createElement('h2');
  title.className = 'text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-4';
  title.textContent = 'Search Friends';

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4';

  function renderUsers(term = value) {
    grid.replaceChildren();
    const normalized = term.trim().toLowerCase();
    const filtered = normalized
      ? SAMPLE_USERS.filter((user) => user.name.toLowerCase().includes(normalized))
      : SAMPLE_USERS;

    if (filtered.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'col-span-full text-center text-sm text-slate-500 dark:text-slate-400 py-12';
      empty.textContent = 'No friends found.';
      grid.appendChild(empty);
      return;
    }

    filtered.forEach((user) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = [
        'flex flex-col items-center gap-2 p-3 rounded-2xl',
        'hover:bg-slate-100 dark:hover:bg-slate-900/60 active:scale-95 transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'
      ].join(' ');

      button.innerHTML = `
        <div class="relative">
          <img src="${user.avatar}" alt="${user.name}" class="h-20 w-20 rounded-full object-cover border-2 border-brand/30" />
        </div>
        <span class="text-sm font-medium text-slate-900 dark:text-white truncate w-full text-center">${user.name}</span>
      `;

      button.addEventListener('click', () => {
        onNavigate?.('#/profile');
      });

      grid.appendChild(button);
    });
  }

  input.addEventListener('input', (event) => {
    renderUsers(event.target.value);
  });

  renderUsers(value);

  resultsWrapper.append(title, grid);
  container.append(header, resultsWrapper);

  return container;
}
