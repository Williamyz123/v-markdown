// src/components/Editor/index.tsx
import React, { useEffect, useRef } from 'react';
import { usePlugins } from '@/plugins/core/PluginContext';
import { createTextFormattingPlugin } from '@/plugins/base/TextFormattingPlugin';
import { Toolbar } from '../Toolbar';
import { EditArea } from '../EditArea';
import { PreviewArea } from '../PreviewArea';

const Editor: React.FC = () => {
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

  return (
    <div className="markdown-editor">
      <Toolbar />
      <div className="editor-main">
        <EditArea />
        <PreviewArea />
      </div>
    </div>
  );
};

export default Editor;
