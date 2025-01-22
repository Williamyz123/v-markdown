// src/components/EditArea/KeyboardHandler.ts
import { useEffect, RefObject } from 'react';
import { usePlugins } from '@/plugins/core/PluginContext';

interface ShortcutMap {
  [key: string]: string; // key: shortcut, value: commandId
}

const SHORTCUTS: ShortcutMap = {
  'ctrl+b': 'bold',
  'ctrl+i': 'italic',
  'ctrl+d': 'strikethrough'
};

export const useKeyboardShortcuts = (textareaRef: RefObject<HTMLTextAreaElement | null>) => {
  const { getPlugin } = usePlugins();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否是我们要处理的快捷键
      const shortcutKey = [
        e.ctrlKey ? 'ctrl' : '',
        e.key.toLowerCase()
      ].filter(Boolean).join('+');

      const commandId = SHORTCUTS[shortcutKey];
      if (commandId) {
        console.log('检测到快捷键:', shortcutKey);
        e.preventDefault();
        const plugin = getPlugin('textFormatting');
        if (plugin?.api) {
          console.log('执行快捷键命令:', commandId);
          plugin.api.commands.executeCommand(commandId);
        }
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => textarea.removeEventListener('keydown', handleKeyDown);
  }, [getPlugin, textareaRef]);
};
