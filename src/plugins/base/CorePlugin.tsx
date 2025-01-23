// src/plugins/base/CorePlugin.tsx
import type { Plugin, EditorAPI } from '@/types/plugin';
import type { Command } from '@/core/commands/CommandSystem';

export const createCorePlugin = (): Plugin => {
  const plugin: Plugin = {
    id: 'core',
    name: 'Core Editor Features',
    description: 'Provides core editor functionality',
    version: '1.0.0',
    api: undefined,

    initialize: (api: EditorAPI) => {
      plugin.api = api;

      // 注册撤销命令
      const undoCommand: Command = {
        id: 'undo',
        execute: () => {
          api.editor.executeAction({ type: 'UNDO' });
        },
        isEnabled: () => {
          const state = api.editor.getState();
          return state.history.past.length > 0;
        }
      };

      // 注册重做命令
      const redoCommand: Command = {
        id: 'redo',
        execute: () => {
          api.editor.executeAction({ type: 'REDO' });
        },
        isEnabled: () => {
          const state = api.editor.getState();
          return state.history.future.length > 0;
        }
      };

      // 注册复制命令
      const copyCommand: Command = {
        id: 'copy',
        execute: () => {
          const content = api.editor.getContent();
          const selection = api.editor.getSelection();
          if (selection.start !== selection.end) {
            navigator.clipboard.writeText(
              content.slice(selection.start, selection.end)
            );
          }
        },
        isEnabled: () => {
          const selection = api.editor.getSelection();
          return selection.start !== selection.end;
        }
      };

      // 注册所有核心命令
      [undoCommand, redoCommand, copyCommand].forEach(command => {
        api.commands.registerCommand(command);
      });
    },

    // 提供工具栏按钮
    renderToolbarItems: () => {
      if (!plugin.api) return [];

      const createButton = (commandId: string, icon: string, title: string) => {
        const handleClick = () => {
          plugin.api!.commands.executeCommand(commandId);
        };

        return (
          <button
            key={commandId}
            className="toolbar-button"
            onClick={handleClick}
            disabled={!plugin.api!.commands.isEnabled(commandId)}
            title={title}
          >
            {icon}
          </button>
        );
      };

      return [
        createButton('undo', '↩', '撤销 (Ctrl+Z)'),
        createButton('redo', '↪', '重做 (Ctrl+Y)'),
        createButton('copy', '📋', '复制 (Ctrl+C)')
      ];
    }
  };

  return plugin;
};
