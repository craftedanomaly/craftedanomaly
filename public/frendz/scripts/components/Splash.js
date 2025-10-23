export function mountSplash({ container = document.body, duration = 1600, onContinue } = {}) {
  const overlay = document.createElement('div');
  overlay.className = [
    'fixed inset-0 z-50 flex flex-col items-center justify-center gap-6',
    'bg-white text-slate-900 dark:bg-slate-950 dark:text-white transition-opacity duration-500'
  ].join(' ');

  const logo = document.createElement('img');
  logo.src = './images/logo.png';
  logo.alt = 'Frendz';
  logo.className = 'w-28 h-28 object-contain splash-logo drop-shadow-lg';

  const wordmark = document.createElement('img');
  wordmark.src = './images/wordmark.svg';
  wordmark.alt = 'Frendz marque';
  wordmark.className = 'h-8 object-contain opacity-80';

  const hint = document.createElement('p');
  hint.textContent = 'Tap to continue';
  hint.className = 'text-sm tracking-wide uppercase text-slate-400 dark:text-slate-500 animate-pulse';

  const finish = () => {
    overlay.classList.add('opacity-0');
    setTimeout(() => {
      overlay.remove();
      cleanup();
      onContinue?.();
    }, 220);
  };

  const handleClick = () => finish();
  const handleKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      finish();
    }
  };

  let cleanupTimeout = setTimeout(finish, duration);

  const cleanup = () => {
    overlay.removeEventListener('click', handleClick);
    window.removeEventListener('keydown', handleKey);
    if (cleanupTimeout) {
      clearTimeout(cleanupTimeout);
      cleanupTimeout = null;
    }
  };

  overlay.addEventListener('click', handleClick);
  window.addEventListener('keydown', handleKey, { passive: true });

  overlay.append(logo, wordmark, hint);
  container.appendChild(overlay);

  return {
    destroy: cleanup,
  };
}
