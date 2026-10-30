import { useCallback, useEffect, useMemo, useState } from 'react';
import ThemeContext from './theme-context';

const THEME_STORAGE_KEY = 'theme';

const getSystemTheme = () => (
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
);

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : getSystemTheme();
};

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('theme-transition');
        root.classList.toggle('dark', theme === 'dark');
        root.style.colorScheme = theme;
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const syncSystemTheme = () => {
            if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                setTheme(mediaQuery.matches ? 'dark' : 'light');
            }
        };
        const syncStoredTheme = (event) => {
            if (event.key === THEME_STORAGE_KEY) {
                setTheme(
                    event.newValue === 'dark' || event.newValue === 'light'
                        ? event.newValue
                        : getSystemTheme()
                );
            }
        };

        mediaQuery.addEventListener('change', syncSystemTheme);
        window.addEventListener('storage', syncStoredTheme);
        return () => {
            mediaQuery.removeEventListener('change', syncSystemTheme);
            window.removeEventListener('storage', syncStoredTheme);
        };
    }, []);

    const toggleTheme = useCallback(() => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        setTheme(nextTheme);
    }, [theme]);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
