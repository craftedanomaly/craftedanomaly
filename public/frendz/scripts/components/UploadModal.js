export function mountCreateModal({ posts = [], onAddPost, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = [
    'fixed inset-0 z-50 flex items-center justify-center p-4',
    'bg-black/70 backdrop-blur'
  ].join(' ');

  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.className = 'relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden w-full max-w-md';

  const header = document.createElement('header');
  header.className = 'px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800';
  header.innerHTML = `
    <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Create new post</h2>
    <button type="button" class="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center" data-action="close">
      <img src="./icons/close.svg" alt="Close" class="h-5 w-5" />
    </button>
  `;

  const closeButton = header.querySelector('[data-action="close"]');
  closeButton.addEventListener('click', () => onClose?.());

  const form = document.createElement('form');
  form.className = 'p-6 space-y-4';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,video/*';
  fileInput.className = 'hidden';
  fileInput.id = 'file-upload';

  const fileLabel = document.createElement('label');
  fileLabel.htmlFor = 'file-upload';
  fileLabel.className = [
    'flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed',
    'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer',
    'hover:border-brand hover:bg-brand/5 transition'
  ].join(' ');
  fileLabel.innerHTML = `
    <img src="./icons/plus.svg" alt="Upload" class="h-12 w-12 mb-3 opacity-50" />
    <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Select photo or video</p>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">or drag and drop</p>
  `;

  const preview = document.createElement('div');
  preview.className = 'hidden relative h-64 rounded-2xl overflow-hidden bg-black';

  const previewMedia = document.createElement('div');
  previewMedia.className = 'w-full h-full flex items-center justify-center';

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'absolute top-3 right-3 h-9 w-9 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur';
  removeButton.innerHTML = '<img src="./icons/close.svg" alt="Remove" class="h-5 w-5" />';

  preview.append(previewMedia, removeButton);

  const captionInput = document.createElement('textarea');
  captionInput.placeholder = 'Write a caption...';
  captionInput.rows = 3;
  captionInput.className = 'w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand';

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'w-full h-11 rounded-full bg-brand text-white font-semibold active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed';
  submitButton.textContent = 'Share';
  submitButton.disabled = true;

  form.append(fileInput, fileLabel, preview, captionInput, submitButton);

  let selectedFile = null;
  let previewURL = null;

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    selectedFile = file;
    const isVideo = file.type.startsWith('video/');
    previewURL = URL.createObjectURL(file);

    previewMedia.replaceChildren();

    if (isVideo) {
      const video = document.createElement('video');
      video.src = previewURL;
      video.className = 'max-w-full max-h-full object-contain';
      video.controls = true;
      video.muted = true;
      video.playsInline = true;
      previewMedia.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = previewURL;
      img.alt = 'Preview';
      img.className = 'max-w-full max-h-full object-contain';
      previewMedia.appendChild(img);
    }

    fileLabel.classList.add('hidden');
    preview.classList.remove('hidden');
    submitButton.disabled = false;
  });

  removeButton.addEventListener('click', () => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      previewURL = null;
    }
    selectedFile = null;
    fileInput.value = '';
    previewMedia.replaceChildren();
    preview.classList.add('hidden');
    fileLabel.classList.remove('hidden');
    submitButton.disabled = true;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!selectedFile || !previewURL) return;

    const isVideo = selectedFile.type.startsWith('video/');
    const newPost = {
      id: `custom-${Date.now()}`,
      user: {
        id: 'me',
        name: 'anomaly',
        avatar: './images/avatars/me.jpg',
      },
      type: isVideo ? 'video' : 'image',
      src: previewURL,
      poster: isVideo ? previewURL : undefined,
      caption: captionInput.value.trim() || 'New post',
      likes: 0,
      time: new Date().toISOString(),
      tags: [],
    };

    onAddPost?.(newPost);
    onClose?.();
  });

  dialog.append(header, form);
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
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
    }
    window.removeEventListener('keydown', handleKey);
    overlay.remove();
  };

  return { destroy };
}
