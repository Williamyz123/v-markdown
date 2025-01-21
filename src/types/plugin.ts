// src/plugins/types/plugin.ts
import { Command } from '@/core/commands/CommandSystem';

// 编辑器API接口
export interface EditorAPI {
  // 命令相关API
  commands: {
    registerCommand: (command: Command) => void;
    executeCommand: (commandId: string) => void;
  };

  // 编辑器状态相关API
  editor: {
    getContent: () => string;
    setContent: (content: string) => void;
    getSelection: () => { start: number; end: number };
    setSelection: (start: number, end: number) => void;
  };

  // 主题相关API
  theme: {
    getCurrentTheme: () => string;
    setTheme: (theme: string) => void;
  };
}

// 插件接口定义
export interface Plugin {
  id: string;                     // 插件唯一标识
  name: string;                   // 插件名称
  description?: string;           // 插件描述
  version?: string;               // 插件版本

  // 生命周期方法
  initialize: (api: EditorAPI) => void;  // 初始化
  destroy?: () => void;                  // 清理

  // 扩展点
  renderToolbarItems?: () => React.ReactNode[];   // 工具栏项
  renderSidebarItems?: () => React.ReactNode[];   // 侧边栏项
  commands?: Command[];                           // 提供的命令
  hooks?: Record<string, any>;                    // 提供的Hooks

  // 可选的依赖声明
  dependencies?: string[];                        // 依赖的其他插件ID
}

// 插件上下文
export interface PluginContext {
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => Plugin | undefined;
  getPluginExtensions: (extensionPoint: string) => React.ReactNode[];
  pluginCount: number; // 添加新的属性
}
