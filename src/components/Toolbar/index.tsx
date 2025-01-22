// src/components/Toolbar/index.tsx
import React from 'react';
import { usePlugins } from '@/plugins/core/PluginContext';
import { useStyles } from '@/styles/StyleContext';

interface ToolbarProps {
  children?: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
  const { getPluginExtensions } = usePlugins();
  const { theme, setTheme, themeOptions, codeTheme, setCodeTheme, codeThemeOptions } = useStyles();

  const toolbarItems = React.useMemo(() => {
    return getPluginExtensions('renderToolbarItems');
  }, [getPluginExtensions]);

  return (
    <div className="editor-toolbar">
      <div className="toolbar-left">
        {toolbarItems}
      </div>
      <div className="toolbar-right">
        <div className="theme-selector">
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="theme-select"
          >
            {themeOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <select
            value={codeTheme}
            onChange={e => setCodeTheme(e.target.value)}
            className="code-theme-select"
          >
            {codeThemeOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
