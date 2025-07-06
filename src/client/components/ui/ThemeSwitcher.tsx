'use client';

import React from 'react';
import { Moon, Sun, Code, Zap } from 'lucide-react';
import { useTheme } from '@/client/context/ThemeContext';
import { getThemeStyles } from '@/client/utils/themeStyles';

// Theme Switcher Component
export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const styles = getThemeStyles(theme);

  const themes = [
    { name: 'performance', icon: Zap, label: 'Performance' },
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
          className={`p-2 rounded transition-all duration-300 hover:scale-105 ${
            theme === name ? styles.accent : styles.secondary
          }`}
          title={label}
          style={{
            backgroundColor: theme === 'matrix' ? 
              (theme === name ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0, 255, 65, 0.1)') : 
              undefined,
            border: theme === 'matrix' ? '1px solid #00ff41' : undefined,
            color: theme === 'matrix' ? '#00ff41' : undefined
          }}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
};