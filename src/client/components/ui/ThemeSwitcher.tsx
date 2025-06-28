'use client';

import React from 'react';
import { Moon, Sun, Code } from 'lucide-react';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';

// Theme Switcher Component
export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const styles = getThemeStyles(theme);

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'matrix', icon: Code, label: 'Matrix' }
  ];

  return (
    <div className="flex gap-2">
      {themes.map(({ name, icon: Icon, label }) => (
        <button
          key={name}
          onClick={() => setTheme(name)}
          className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
            theme === name ? styles.accent : 'bg-gray-600/50 hover:bg-gray-600/70'
          } ${styles.text}`}
          title={label}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
};