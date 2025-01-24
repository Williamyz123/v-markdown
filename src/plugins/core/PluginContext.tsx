// src/plugins/core/PluginContext.tsx
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import { PluginManager } from './PluginManager';
import {EditorAPI, Plugin, PluginContext as IPluginContext} from '@/types/plugin';
import { useEditor } from '@/core/editor/EditorContext';
import { useCommands } from '@/core/commands/CommandSystem';
import {EditorAction} from "@/types/editor";

// 创建插件系统的 Context
const PluginContext = createContext<IPluginContext | null>(null);

// 插件系统的 Provider 组件
// 负责初始化插件管理器，并为子组件提供插件系统的访问能力
export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children
                                                                        }) => {
  const editor = useEditor();
  const { registerCommand, executeCommand, isEnabled } = useCommands();
  const [pluginCount, setPluginCount] = useState(0);

  // 创建一个 ref 来存储最新的编辑器状态
  const editorStateRef = useRef(editor.state);

  // 当编辑器状态改变时更新 ref
  useEffect(() => {
    editorStateRef.current = editor.state;
  }, [editor.state]);

  // 使用 useMemo 确保 API 引用稳定
  const editorAPI = useMemo<EditorAPI>(() => ({
    commands: {
      registerCommand,
      executeCommand,
      isEnabled
    },
    editor: {
      getContent: () => {
        // 使用 ref 获取最新的内容
        const content = editorStateRef.current.content;
        return content;
      },
      setContent: (content) => {
        return editor.handleContentUpdate(content, []);
      },
      getSelection: () => {
        // 使用 ref 获取最新的选区
        const selection = editorStateRef.current.selection;
        return selection;
      },
      setSelection: (start, end) => {
        editor.dispatch({ type: 'UPDATE_SELECTION', payload: { start, end } });
      },
      // 新增 getState 方法
      getState: () => {
        return editorStateRef.current;
      },
      // 新增 executeAction 方法
      executeAction: (action: EditorAction) => {
        console.log('executeAction 被调用，动作:', action);
        editor.dispatch(action);
      }
    },
    theme: {
      getCurrentTheme: () => document.documentElement.dataset.theme || 'light',
      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme;
      }
    }
  }), [editor, registerCommand, executeCommand]);

  // 使用 useRef 保持 pluginManager 引用稳定
  const pluginManagerRef = useRef<PluginManager | null>(null);

  // 初始化 pluginManager
  if (!pluginManagerRef.current) {
    console.log('创建新的 PluginManager');
    pluginManagerRef.current = new PluginManager(editorAPI);
  }

  // 注册插件的函数
  const registerPlugin = useCallback((plugin: Plugin) => {
    console.log('尝试注册插件:', plugin.id);
    if (pluginManagerRef.current) {
      pluginManagerRef.current.registerPlugin(plugin);
      setPluginCount(prev => prev + 1);
    }
  }, []);

  // 创建 Context 值
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
