export function createStoryBar({ stories = [], seenMap, onOpenStory }) {
  const wrapper = document.createElement('section');
  wrapper.className = 'pt-4 pb-3 border-b border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 lg:border lg:rounded-lg lg:mb-4';

  const scroller = document.createElement('div');
  scroller.className = [
    'flex gap-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory',
    '[-ms-overflow-style:none] [scrollbar-width:none]'
  ].join(' ');
  scroller.setAttribute('role', 'list');
  scroller.style.scrollbarWidth = 'none';
  scroller.style.msOverflowStyle = 'none';
  // Mouse wheel horizontal scroll
  scroller.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    scroller.scrollLeft += event.deltaY;
    event.preventDefault();
  }, { passive: false });

  // Touch swipe support
  let touchStartX = 0;
  let scrollStartX = 0;
  
  scroller.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    scrollStartX = scroller.scrollLeft;
  }, { passive: true });
  
  scroller.addEventListener('touchmove', (event) => {
    const touchX = event.touches[0].clientX;
    const diff = touchStartX - touchX;
    scroller.scrollLeft = scrollStartX + diff;
  }, { passive: true });

  if (stories.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'px-4 py-6 text-sm text-slate-500 dark:text-slate-400';
    empty.textContent = 'No stories yet.';
    wrapper.appendChild(empty);
    return wrapper;
  }

  stories.forEach((story) => {
    const item = document.createElement('button');
    const seen = !!seenMap?.get(story.id);
    item.type = 'button';
    item.className = [
      'flex flex-col items-center gap-2 w-16 shrink-0 snap-start focus:outline-none focus-visible:ring-2',
      'focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
      seen ? 'opacity-60' : 'opacity-100'
    ].join(' ');
    item.setAttribute('role', 'listitem');

    const avatarWrapper = document.createElement('span');
    avatarWrapper.className = [
      'relative rounded-full p-[2px] bg-gradient-to-tr from-brand-dark via-brand to-orange-500',
      seen ? 'opacity-40' : 'opacity-100'
    ].join(' ');

    const avatar = document.createElement('img');
    avatar.src = story.user?.avatar ?? '/frendz/images/avatars/placeholder.jpg';
    avatar.alt = `${story.user?.name ?? 'Story'} avatar`;
    avatar.className = 'w-16 h-16 rounded-full object-cover border-4 border-white dark:border-slate-900';

    avatarWrapper.appendChild(avatar);

    const name = document.createElement('span');
    name.className = 'text-xs font-medium text-slate-700 dark:text-slate-200 truncate w-full text-center';
    name.textContent = story.user?.name ?? 'Unknown';

    item.append(avatarWrapper, name);
    item.addEventListener('click', () => onOpenStory?.(story.id));

    scroller.appendChild(item);
  });

  wrapper.appendChild(scroller);
  return wrapper;
}
