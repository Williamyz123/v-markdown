// src/components/Editor/index.tsx
import React, { useEffect, useRef } from 'react';
import { useStyles } from '@/styles/StyleContext';
import { usePlugins } from '@/plugins/core/PluginContext';
import { createTextFormattingPlugin } from '@/plugins/base/TextFormattingPlugin';
import { Toolbar } from '../Toolbar';
import { EditArea } from '../EditArea';
import { PreviewArea } from '../PreviewArea';

const Editor: React.FC = () => {
  const { theme, setTheme } = useStyles();
  const { registerPlugin } = usePlugins();
  const pluginRegistered = useRef(false);

  // 初始化插件
  useEffect(() => {
    if (!pluginRegistered.current) {
      console.log('开始注册文本格式化插件');
      const plugin = createTextFormattingPlugin();
      registerPlugin(plugin);
      console.log('文本格式化插件注册完成');
      pluginRegistered.current = true;
    }
  }, [registerPlugin]);

  const themes = [
    { id: 'light', name: '浅色主题' },
    { id: 'dark', name: '深色主题' }
  ];

  return (
    <div className="markdown-editor">
      <Toolbar>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="theme-selector"
        >
          {themes.map(theme => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </Toolbar>
      <div className="editor-main">
        <EditArea />
        <PreviewArea />
      </div>
    </div>
  );
};

export default Editor;
