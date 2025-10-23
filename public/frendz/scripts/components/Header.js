const THEME_LABELS = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

function themeIcon(mode) {
  if (mode === 'dark') return '/frendz/icons/moon.svg';
  if (mode === 'light') return '/frendz/icons/sun.svg';
  return '/frendz/icons/auto.svg';
}

export function createHeader({ title, showDM, onLogoClick, onOpenMessages, themeMode, onThemeToggle, muted, onToggleMuted }) {
  const header = document.createElement('header');
  header.className = 'px-4 py-3 flex items-center gap-3';
  header.innerHTML = `
    <button type="button" class="shrink-0 active:scale-95 transition" aria-label="Go home">
      <img src="/frendz/images/logo.png" alt="Frendz" class="h-9 w-9 object-contain" />
    </button>
    <div class="flex-1">
      <h1 class="text-lg font-semibold text-slate-900 dark:text-white">${title}</h1>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" class="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 active:scale-95 transition" data-action="toggle-muted" aria-pressed="${muted ? 'true' : 'false'}" aria-label="${muted ? 'Unmute videos' : 'Mute videos'}">
        <img src="${muted ? '/frendz/icons/muted.svg' : '/frendz/icons/volume.svg'}" alt="Audio" class="h-5 w-5" />
      </button>
      <button type="button" class="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 active:scale-95 transition" data-action="toggle-theme" aria-label="Change theme">
        <img src="${themeIcon(themeMode)}" alt="Theme" class="h-5 w-5" />
        <span class="sr-only">${THEME_LABELS[themeMode] ?? 'Theme'}</span>
      </button>
      ${showDM ? `<button type="button" class="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 active:scale-95 transition" data-action="open-messages" aria-label="Open messages">
        <img src="/frendz/icons/dm.svg" alt="Messages" class="h-5 w-5" />
      </button>` : ''}
    </div>
  `;

  const logoButton = header.querySelector('button');
  logoButton.addEventListener('click', () => onLogoClick?.());

  const themeButton = header.querySelector('[data-action="toggle-theme"]');
  themeButton.addEventListener('click', () => onThemeToggle?.());

  const muteButton = header.querySelector('[data-action="toggle-muted"]');
  muteButton.addEventListener('click', () => onToggleMuted?.());

  if (showDM) {
    const dmButton = header.querySelector('[data-action="open-messages"]');
    dmButton.addEventListener('click', () => onOpenMessages?.());
  }

  return header;
}
