'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export type AppTheme = 'cyberpunk' | 'technical' | 'light' | 'pastel';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>('cyberpunk');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('tradevault-theme') as AppTheme;
    if (savedTheme && ['cyberpunk', 'technical', 'light', 'pastel'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('tradevault-theme', newTheme);
  };

  // We apply the theme class to the document body so CSS variables kick in
  useEffect(() => {
    if (mounted) {
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      
      // Force cyberpunk theme on public landing/login pages
      const activeTheme = pathname?.startsWith('/dashboard') ? theme : 'cyberpunk';
      document.body.classList.add(`theme-${activeTheme}`);
    }
  }, [theme, mounted, pathname]);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
