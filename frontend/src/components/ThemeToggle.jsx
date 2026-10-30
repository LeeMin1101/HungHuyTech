import { Moon, Sun } from 'lucide-react';
import useTheme from '../context/useTheme';

const ThemeToggle = ({ transparent = false, className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const label = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
    const Icon = isDark ? Sun : Moon;

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={label}
            title={label}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                transparent
                    ? 'bg-white/20 text-white backdrop-blur-md hover:bg-white/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-yellow-300 dark:hover:bg-slate-600'
            } ${className}`}
        >
            <Icon size={19} aria-hidden="true" />
        </button>
    );
};

export default ThemeToggle;
