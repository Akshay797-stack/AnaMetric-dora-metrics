import React, { createContext, useEffect, useState, useCallback } from "react";

export const ThemeContext = createContext();

const THEMES = ["light", "dark", "blue"];
const getInitialTheme = () => {
  const stored = localStorage.getItem("theme");
  if (THEMES.includes(stored)) return stored;
  // Prefer system theme if not set
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.body.classList.remove(...THEMES);
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
