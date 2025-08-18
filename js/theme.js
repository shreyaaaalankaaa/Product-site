/**
 * Theme Manager
 * Handles light/dark mode toggle and persistence
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.themeToggleBtn = null;
        this.themeIcon = null;
        
        this.init();
    }

    init() {
        this.themeToggleBtn = document.querySelector('.theme-toggle');
        this.themeIcon = this.themeToggleBtn?.querySelector('.theme-icon use');
        
        if (!this.themeToggleBtn) {
            console.warn('Theme toggle button not found');
            return;
        }

        this.loadSavedTheme();
        this.setupEventListeners();
        this.updateThemeIcon();
    }

    setupEventListeners() {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });

            // Keyboard support
            this.themeToggleBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!this.hasUserPreference()) {
                    this.setTheme(e.matches ? 'dark' : 'light', false);
                }
            });
        }

        // Handle storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme-preference') {
                this.setTheme(e.newValue || 'light', false);
            }
        });
    }

    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('theme-preference');
            
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                this.setTheme(savedTheme, false);
            } else {
                // No saved preference, use system preference
                const prefersDark = window.matchMedia && 
                                  window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.setTheme(prefersDark ? 'dark' : 'light', false);
            }
        } catch (error) {
            console.error('Error loading saved theme:', error);
            this.setTheme('light', false);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme, true);
        
        // Provide haptic feedback if supported
        this.triggerHapticFeedback();
        
        // Announce theme change to screen readers
        this.announceThemeChange(newTheme);
    }

    setTheme(theme, savePreference = true) {
        if (theme !== 'light' && theme !== 'dark') {
            console.warn('Invalid theme:', theme);
            return;
        }

        this.currentTheme = theme;
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        // Save preference if requested
        if (savePreference) {
            this.saveThemePreference(theme);
        }
        
        // Update UI
        this.updateThemeIcon();
        this.updateToggleLabel();
        
        // Dispatch theme change event
        this.dispatchThemeChangeEvent(theme);
    }

    saveThemePreference(theme) {
        try {
            localStorage.setItem('theme-preference', theme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }

    hasUserPreference() {
        try {
            return localStorage.getItem('theme-preference') !== null;
        } catch (error) {
            return false;
        }
    }

    updateThemeIcon() {
        if (!this.themeIcon) return;

        const iconName = this.currentTheme === 'light' ? 'sun' : 'moon';
        this.themeIcon.setAttribute('href', `assets/icons.svg#${iconName}`);
    }

    updateToggleLabel() {
        if (!this.themeToggleBtn) return;

        const action = this.currentTheme === 'light' ? 'Enable' : 'Disable';
        const label = `${action} dark mode`;
        
        this.themeToggleBtn.setAttribute('aria-label', label);
        this.themeToggleBtn.setAttribute('title', label);
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.getElementsByTagName('head')[0].appendChild(metaThemeColor);
        }
        
        const color = theme === 'dark' ? '#111827' : '#ffffff';
        metaThemeColor.content = color;
    }

    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: theme,
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
    }

    announceThemeChange(theme) {
        const message = `Switched to ${theme} mode`;
        
        // Create temporary announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }

    triggerHapticFeedback() {
        // Trigger haptic feedback on supported devices
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    // Public API methods
    getCurrentTheme() {
        return this.currentTheme;
    }

    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    isLightMode() {
        return this.currentTheme === 'light';
    }

    // Force theme without user preference
    forceTheme(theme) {
        this.setTheme(theme, false);
    }

    // Reset to system preference
    resetToSystemPreference() {
        try {
            localStorage.removeItem('theme-preference');
            const prefersDark = window.matchMedia && 
                              window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light', false);
        } catch (error) {
            console.error('Error resetting theme preference:', error);
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    
    // Listen for theme change events
    document.addEventListener('themeChanged', (e) => {
        console.log('Theme changed to:', e.detail.theme);
        // Here you could integrate with analytics or other systems
    });
});

// Apply theme as early as possible to prevent flash
(function() {
    try {
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            const prefersDark = window.matchMedia && 
                              window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    } catch (error) {
        // Fallback to light theme
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
