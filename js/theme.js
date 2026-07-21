class ThemeManager {
  constructor() {
    this.key = 'shophub-theme';
    this.button = document.querySelector('.theme-toggle');
    const saved = localStorage.getItem(this.key);
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    this.theme = saved || (systemDark ? 'dark' : 'light');
    this.apply(this.theme);
    this.button?.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.key, this.theme);
    this.apply(this.theme);
  }

  apply(theme) {
    document.documentElement.dataset.theme = theme;
    const isDark = theme === 'dark';
    const icon = this.button?.querySelector('use');
    icon?.setAttribute('href', `assets/icons.svg#${isDark ? 'sun' : 'moon'}`);
    this.button?.setAttribute('aria-label', `${isDark ? 'Disable' : 'Enable'} dark mode`);
    this.button?.setAttribute('title', `${isDark ? 'Disable' : 'Enable'} dark mode`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#08111f' : '#f8fafc');
  }
}

document.addEventListener('DOMContentLoaded', () => new ThemeManager());
