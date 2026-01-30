import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        // Check initial theme
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initialTheme = savedTheme || 'dark'; // Default to dark

        console.log('🎨 Initial theme:', initialTheme);
        setTheme(initialTheme);

        // Apply theme immediately
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        console.log('🎨 Theme Toggle - Current:', theme, '→ New:', newTheme);
        setTheme(newTheme);

        // Apply theme to document
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        console.log('🎨 HTML element classes:', document.documentElement.className);

        // Save to localStorage
        localStorage.setItem('theme', newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Alternar tema"
        >
            {theme === 'dark' ? (
                <>
                    <Sun size={16} />
                    <span>Modo Claro</span>
                </>
            ) : (
                <>
                    <Moon size={16} />
                    <span>Modo Escuro</span>
                </>
            )}
        </button>
    );
};
