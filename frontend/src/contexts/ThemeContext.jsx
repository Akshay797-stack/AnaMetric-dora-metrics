import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const themes = useMemo(() => ({
    light: {
      // Primary Colors
      primary: '#1a1a2e',
      primaryLight: '#16213e',
      primaryDark: '#0f3460',
      
      // Secondary Colors
      secondary: '#e94560',
      secondaryLight: '#ff6b8a',
      secondaryDark: '#c41e3a',
      
      // Accent Colors
      accent: '#00d4ff',
      accentLight: '#4de8ff',
      accentDark: '#0099cc',
      
      // Success Colors
      success: '#10b981',
      successLight: '#34d399',
      successDark: '#059669',
      
      // Warning Colors
      warning: '#f59e0b',
      warningLight: '#fbbf24',
      warningDark: '#d97706',
      
      // Error Colors
      error: '#ef4444',
      errorLight: '#f87171',
      errorDark: '#dc2626',
      
      // Neutral Colors
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      surfaceActive: '#e2e8f0',
      
      // Text Colors
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textTertiary: '#64748b',
      textInverse: '#ffffff',
      
      // Border Colors
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      borderDark: '#cbd5e1',
      
      // Shadow Colors
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowLight: 'rgba(0, 0, 0, 0.05)',
      shadowDark: 'rgba(0, 0, 0, 0.2)',
      
      // Gradient Colors
      gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradientSecondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      gradientAccent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      
      // Glass Effect
      glass: 'rgba(255, 255, 255, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      
      // Status Colors
      info: '#3b82f6',
      infoLight: '#60a5fa',
      infoDark: '#2563eb',
    },
    dark: {
      // Primary Colors
      primary: '#ffffff',
      primaryLight: '#f8fafc',
      primaryDark: '#e2e8f0',
      
      // Secondary Colors
      secondary: '#e94560',
      secondaryLight: '#ff6b8a',
      secondaryDark: '#c41e3a',
      
      // Accent Colors
      accent: '#00d4ff',
      accentLight: '#4de8ff',
      accentDark: '#0099cc',
      
      // Success Colors
      success: '#10b981',
      successLight: '#34d399',
      successDark: '#059669',
      
      // Warning Colors
      warning: '#f59e0b',
      warningLight: '#fbbf24',
      warningDark: '#d97706',
      
      // Error Colors
      error: '#ef4444',
      errorLight: '#f87171',
      errorDark: '#dc2626',
      
      // Neutral Colors
      background: '#0a0a0a',
      surface: '#1a1a1a',
      surfaceHover: '#2a2a2a',
      surfaceActive: '#3a3a3a',
      
      // Text Colors
      textPrimary: '#ffffff',
      textSecondary: '#e2e8f0',
      textTertiary: '#cbd5e1',
      textInverse: '#0f172a',
      
      // Border Colors
      border: '#2a2a2a',
      borderLight: '#3a3a3a',
      borderDark: '#1a1a1a',
      
      // Shadow Colors
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowLight: 'rgba(0, 0, 0, 0.2)',
      shadowDark: 'rgba(0, 0, 0, 0.5)',
      
      // Gradient Colors
      gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradientSecondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      gradientAccent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      
      // Glass Effect
      glass: 'rgba(0, 0, 0, 0.3)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      
      // Status Colors
      info: '#3b82f6',
      infoLight: '#60a5fa',
      infoDark: '#2563eb',
    }
  }), []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    Object.entries(themes[theme]).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
  }, [theme, themes]);

  const value = {
    theme,
    themes: themes[theme],
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
