// src/components/EditArea/KeyboardHandler.ts
import { useEffect, RefObject } from 'react';
import { usePlugins } from '@/plugins/core/PluginContext';

// 快捷键映射类型定义
export interface KeyboardShortcut {
  key: string;        // 按键（如 'b', 'z'）
  ctrlKey?: boolean;  // 是否需要按住 Ctrl
  altKey?: boolean;   // 是否需要按住 Alt
  shiftKey?: boolean; // 是否需要按住 Shift
  commandId: string;  // 对应的命令ID
  pluginId: string;   // 处理该命令的插件ID
}

// 默认的快捷键配置
const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // CorePlugin shortcuts
  { key: 'z', ctrlKey: true, commandId: 'undo', pluginId: 'core' },
  { key: 'y', ctrlKey: true, commandId: 'redo', pluginId: 'core' },
  { key: 'c', ctrlKey: true, commandId: 'copy', pluginId: 'core' },

  // TextFormattingPlugin shortcuts
  { key: 'b', ctrlKey: true, commandId: 'bold', pluginId: 'textFormatting' },
  { key: 'i', ctrlKey: true, commandId: 'italic', pluginId: 'textFormatting' },
  { key: 'd', ctrlKey: true, commandId: 'strikethrough', pluginId: 'textFormatting' }
];

export const useKeyboardShortcuts = (textareaRef: RefObject<HTMLTextAreaElement | null>) => {
  const { getPlugin } = usePlugins();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 获取按键状态
      const keyState = {
        key: e.key.toLowerCase(),
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey
      };

      // 检查是否匹配任何快捷键
      const matchedShortcut = DEFAULT_SHORTCUTS.find(shortcut => {
        return shortcut.key === keyState.key &&
          !!shortcut.ctrlKey === keyState.ctrlKey &&
          !!shortcut.altKey === keyState.altKey &&
          !!shortcut.shiftKey === keyState.shiftKey;
      });

      if (matchedShortcut) {
        console.log('检测到快捷键:', matchedShortcut);
        e.preventDefault();

        const plugin = getPlugin(matchedShortcut.pluginId);
        if (plugin?.api) {
          // 检查命令是否可用
          if (plugin.api.commands.isEnabled(matchedShortcut.commandId)) {
            console.log('执行命令:', matchedShortcut.commandId, '来自插件:', matchedShortcut.pluginId);
            plugin.api.commands.executeCommand(matchedShortcut.commandId);
          } else {
            console.log('命令当前不可用:', matchedShortcut.commandId);
          }
        } else {
          console.warn('未找到处理该命令的插件:', matchedShortcut.pluginId);
        }
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => textarea.removeEventListener('keydown', handleKeyDown);
  }, [getPlugin, textareaRef]);
};
