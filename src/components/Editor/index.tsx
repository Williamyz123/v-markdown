// src/components/Editor/index.tsx
import React, {useEffect, useRef} from 'react';
import { usePlugins } from '@/plugins/core/PluginContext';
import { createTextFormattingPlugin } from '@/plugins/base/TextFormattingPlugin';
import {Toolbar} from '@/components/Toolbar';
import {EditArea} from '@/components/EditArea';
import {PreviewArea} from '@/components/PreviewArea';

const Editor: React.FC = () => {
  const { registerPlugin } = usePlugins();
  // 使用 ref 来追踪插件是否已经注册
  const pluginRegistered = useRef(false);

  useEffect(() => {
    // 只在组件首次挂载时注册插件
    if (!pluginRegistered.current) {
      console.log('开始注册文本格式化插件');
      const plugin = createTextFormattingPlugin();
      registerPlugin(plugin);
      console.log('文本格式化插件注册完成');
      pluginRegistered.current = true;
    }
  }, [registerPlugin]); // 保留 registerPlugin 作为依赖

  return (
    <div className="markdown-editor">
      <Toolbar />
      <EditArea />
      <PreviewArea />
    </div>
  );
};

export default Editor;
