// src/components/Toolbar/index.tsx
import React, {useMemo} from 'react';
import { usePlugins } from '@/plugins/core/PluginContext';

export const Toolbar: React.FC = () => {
  const { getPluginExtensions, pluginCount } = usePlugins();

  // 使用 pluginCount 作为依赖，确保插件变化时重新获取扩展
  const toolbarItems = useMemo(() => {
    console.log('获取工具栏项，当前插件数:', pluginCount);
    return getPluginExtensions('renderToolbarItems');
  }, [getPluginExtensions, pluginCount]);

  return (
    <div className="editor-toolbar">
      156
      {toolbarItems}
    </div>
  );
};
