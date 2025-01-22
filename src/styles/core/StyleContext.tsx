// src/styles/core/StyleContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface ThemeOption {
  id: string;
  name: string;
}

interface StyleContextType {
  theme: string;
  codeTheme: string;
  setTheme: (theme: string) => void;
  setCodeTheme: (theme: string) => void;
  themeOptions: ThemeOption[];
  codeThemeOptions: ThemeOption[];
}

const defaultThemeOptions: ThemeOption[] = [
  { id: 'light', name: '浅色主题' },
  { id: 'dark', name: '深色主题' }
];

const defaultCodeThemeOptions: ThemeOption[] = [
  { id: 'github', name: 'GitHub' },
  { id: 'monokai', name: 'Monokai' }
];

const StyleContext = createContext<StyleContextType | null>(null);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [codeTheme, setCodeTheme] = useState('github');

  const value = {
    theme,
    codeTheme,
    setTheme,
    setCodeTheme,
    themeOptions: defaultThemeOptions,
    codeThemeOptions: defaultCodeThemeOptions
  };

  return (
    <StyleContext.Provider value={value}>
      <div className="markdown-editor" data-theme={theme} data-code-theme={codeTheme}>
        {children}
      </div>
    </StyleContext.Provider>
  );
};

export const useStyles = () => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyles must be used within a StyleProvider');
  }
  return context;
};
