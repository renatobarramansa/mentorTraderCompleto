// frontend/components/theme/ThemeToggle.tsx
'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        relative
        p-2
        rounded-lg
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500
        focus:ring-offset-2 dark:focus:ring-offset-gray-800
        animate-theme-toggle
      "
      aria-label={`Alternar para tema ${isDark ? 'claro' : 'escuro'}`}
      title={`Tema atual: ${isDark ? 'Escuro' : 'Claro'}`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`
            absolute
            w-5 h-5
            text-yellow-500
            transition-all
            duration-300
            ${!isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}
          `}
        />
        <Moon
          className={`
            absolute
            w-5 h-5
            text-blue-300
            transition-all
            duration-300
            ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}
          `}
        />
      </div>
    </button>
  );
}