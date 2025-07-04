'use client';

import React, { useState, useEffect, useContext, createContext } from 'react';

// Theme Context
interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('performance');

  // Load theme from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const validThemes = ['performance', 'light', 'dark', 'matrix'];
      
      // Use saved theme only if it's valid, otherwise default to performance
      if (savedTheme && validThemes.includes(savedTheme)) {
        setTheme(savedTheme);
      } else {
        setTheme('performance');
        localStorage.setItem('theme', 'performance');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook for Theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};