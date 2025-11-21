const STORAGE_KEY = 'theme';
const DATA_ATTRIBUTE = 'data-theme';
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

const switcherElement = document.getElementById('theme-switcher');

document.body.classList.remove('no-js');

function setTheme(theme) {
  document.documentElement.setAttribute(DATA_ATTRIBUTE, theme);

  if (switcherElement) {
    switcherElement.textContent = theme === 'light' ? '🌙' : '☀️';
  }
}

// init
setTheme(
  localStorage.getItem(STORAGE_KEY) ||
    (window.matchMedia(PREFERS_DARK_QUERY).matches ? 'dark' : 'light')
);

switcherElement?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute(DATA_ATTRIBUTE) || 'light';
  const next = current === 'light' ? 'dark' : 'light';

  localStorage.setItem(STORAGE_KEY, next);
  setTheme(next);
});

// listen for updates to system theme
window.matchMedia(PREFERS_DARK_QUERY).addEventListener('change', (e) => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});
