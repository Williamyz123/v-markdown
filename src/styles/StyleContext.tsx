// src/styles/core/StyleContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

// 主题选项接口
interface ThemeOption {
  id: string;
  name: string;
}

// 样式上下文接口
interface StyleContextType {
  theme: string;
  codeTheme: string;
  setTheme: (theme: string) => void;
  setCodeTheme: (theme: string) => void;
  themeOptions: ThemeOption[];
  codeThemeOptions: ThemeOption[];
}

// 预定义主题选项
const themeOptions: ThemeOption[] = [
  { id: 'light', name: '浅色主题' },
  { id: 'dark', name: '深色主题' }
];

// 预定义代码主题选项
const codeThemeOptions: ThemeOption[] = [
  { id: 'github', name: 'GitHub' },
  { id: 'monokai', name: 'Monokai' }
];

// 创建样式上下文
const StyleContext = createContext<StyleContextType | null>(null);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 主题状态
  const [theme, setThemeState] = useState('light');
  const [codeTheme, setCodeThemeState] = useState('github');

  // 主题切换处理函数
  const setTheme = useCallback((newTheme: string) => {
    if (themeOptions.some(option => option.id === newTheme)) {
      setThemeState(newTheme);
      // 更新 HTML 属性以触发样式切换
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  }, []);

  // 代码主题切换处理函数
  const setCodeTheme = useCallback((newCodeTheme: string) => {
    if (codeThemeOptions.some(option => option.id === newCodeTheme)) {
      setCodeThemeState(newCodeTheme);
      // 更新预览区域的代码主题
      const previewArea = document.querySelector('.preview-area');
      if (previewArea) {
        previewArea.setAttribute('data-code-theme', newCodeTheme);
      }
    }
  }, []);

  // 提供给子组件的上下文值
  const contextValue = {
    theme,
    codeTheme,
    setTheme,
    setCodeTheme,
    themeOptions,
    codeThemeOptions
  };

  return (
    <StyleContext.Provider value={contextValue}>
      <div
        className="markdown-editor"
        data-theme={theme}
      >
        {children}
      </div>
    </StyleContext.Provider>
  );
};

// 自定义 Hook，用于在组件中访问样式上下文
export const useStyles = () => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyles must be used within a StyleProvider');
  }
  return context;
};

export default StyleProvider;
