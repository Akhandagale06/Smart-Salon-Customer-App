import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('customer_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('customer_theme', theme);
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'light') {
      root.classList.add('theme-light', 'light');
      root.classList.remove('dark');
      body.classList.add('theme-light', 'light');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('theme-light', 'light');
      root.classList.add('dark');
      body.classList.remove('theme-light', 'light');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
