// src/plugins/core/PluginContext.tsx
import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import { PluginManager } from './PluginManager';
import { Plugin, PluginContext as IPluginContext } from '@/types/plugin';
import { useEditor } from '@/core/editor/EditorContext';
import { useCommands } from '@/core/commands/CommandSystem';


// 创建插件系统的 Context
const PluginContext = createContext<IPluginContext | null>(null);

// 插件系统的 Provider 组件
// 负责初始化插件管理器，并为子组件提供插件系统的访问能力
export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children
                                                                        }) => {
  const editor = useEditor();
  const commands = useCommands();
  const [pluginCount, setPluginCount] = useState(0);

  // 使用 useRef 来保持 pluginManager 的引用稳定
  const pluginManagerRef = useRef<PluginManager | null>(null);

  // 初始化 pluginManager
  if (!pluginManagerRef.current) {
    pluginManagerRef.current = new PluginManager({
      commands,
      editor: {
        getContent: () => editor.state.content,
        setContent: (content) => editor.handleContentUpdate(content, []),
        getSelection: () => editor.state.selection,
        setSelection: (start, end) =>
          editor.dispatch({ type: 'UPDATE_SELECTION', payload: { start, end } })
      },
      theme: {
        getCurrentTheme: () => document.documentElement.dataset.theme || 'light',
        setTheme: (theme) => {
          document.documentElement.dataset.theme = theme;
        }
      }
    });
  }

  const registerPlugin = useCallback((plugin: Plugin) => {
    if (pluginManagerRef.current) {
      pluginManagerRef.current.registerPlugin(plugin);
      setPluginCount(prev => prev + 1);
    }
  }, []); // 移除所有依赖

  const value = useMemo<IPluginContext>(() => ({
    registerPlugin,
    unregisterPlugin: (pluginId) => {
      if (pluginManagerRef.current) {
        pluginManagerRef.current.unregisterPlugin(pluginId);
        setPluginCount(prev => prev - 1);
      }
    },
    getPlugin: (pluginId) => pluginManagerRef.current?.getPlugin(pluginId),
    getPluginExtensions: (extensionPoint) =>
      pluginManagerRef.current?.getExtensions(extensionPoint as keyof Plugin) ?? [],
    pluginCount
  }), [registerPlugin, pluginCount]);

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  );
};

// 自定义 Hook，用于在组件中访问插件系统
// 如果在 Provider 外部使用会抛出错误
export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};
