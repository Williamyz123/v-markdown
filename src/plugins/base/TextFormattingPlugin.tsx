// src/plugins/base/TextFormattingPlugin.tsx
import React from 'react';
import type { Plugin, EditorAPI } from '@/types/plugin';
import type { Command } from '@/core/commands/CommandSystem';

// 工具栏按钮的属性接口
interface ToolbarButtonProps {
  icon: string;
  title: string;
  onClick: () => void;
  isActive?: boolean;
}

// 工具栏按钮组件
const ToolbarButton: React.FC<ToolbarButtonProps> = ({
                                                       icon,
                                                       title,
                                                       onClick,
                                                       isActive
                                                     }) => (
  <button
    className={`toolbar-button ${isActive ? 'active' : ''}`}
    onMouseDown={(e) => {
      e.preventDefault();
    }}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
  >
    <span className="button-content">{icon}</span>
  </button>
);

// 创建文本格式化插件的工厂函数
export const createTextFormattingPlugin = (): Plugin => {
  // 创建插件实例
  const plugin: Plugin = {
    id: 'textFormatting',
    name: 'Text Formatting',
    description: '提供基本的文本格式化功能',
    version: '1.0.0',
    api: undefined,

    // 初始化插件
    initialize: (api: EditorAPI) => {
      console.log('初始化文本格式化插件');
      plugin.api = api;

      // 创建格式化命令的工厂函数
      const createFormatCommand = (
        commandId: string,
        marker: string,
        markerLength: number
      ): Command => ({
        id: commandId,
        execute: () => {
          console.log(`执行${commandId}命令`);
          const content = api.editor.getContent();
          const selection = api.editor.getSelection();

          console.log('命令执行时的选区:', selection);
          console.log('命令执行时的内容:', content);

          // 检查是否有有效的选区
          if (selection.start === selection.end) {
            console.log('没有选中文本，命令终止');
            return;
          }

          // 检查选区是否在内容范围内
          if (selection.start < 0 || selection.end > content.length) {
            console.log('无效的选区范围，命令终止');
            return;
          }

          // 分割文本并添加标记
          const before = content.slice(0, selection.start);
          const selected = content.slice(selection.start, selection.end);
          const after = content.slice(selection.end);

          console.log('文本分割结果:', { before, selected, after });

          const newContent = `${before}${marker}${selected}${marker}${after}`;
          console.log('新内容:', newContent);

          // 更新内容
          api.editor.setContent(newContent);
          console.log('内容已更新');

          // 计算新的选区位置
          const newStart = selection.start;
          const newEnd = selection.end + (markerLength * 2);
          console.log('新选区位置:', { newStart, newEnd });

          // 更新选区
          api.editor.setSelection(newStart, newEnd);
        },

        // 添加命令可用性检查
        isEnabled: () => {
          const selection = api.editor.getSelection();
          // 只有当有文本被选中时命令才可用
          return selection.start !== selection.end;
        }
      });

      // 注册所有格式化命令
      const commands = [
        ['bold', '**', 2],
        ['italic', '*', 1],
        ['strikethrough', '~~', 2]
      ];

      commands.forEach(([id, marker, length]) => {
        const command = createFormatCommand(
          id as string,
          marker as string,
          length as number
        );
        console.log(`注册${id}命令`);
        api.commands.registerCommand(command);
      });

      console.log('文本格式化插件初始化完成');
    },

    // 渲染工具栏按钮
    renderToolbarItems: () => {
      if (!plugin.api) {
        console.warn('插件API未初始化');
        return [];
      }

      const createButton = (
        commandId: string,
        icon: string,
        title: string,
        shortcut: string
      ) => {
        const handleClick = () => {
          const selection = plugin.api!.editor.getSelection();
          console.log('点击按钮，当前选区:', selection);
          console.log('当前内容:', plugin.api!.editor.getContent());

          plugin.api!.commands.executeCommand(commandId);
        };

        return (
          <ToolbarButton
            key={commandId}
            icon={icon}
            title={`${title} (${shortcut})`}
            onClick={handleClick}
          />
        );
      };

      return [
        createButton('bold', 'B', '加粗', 'Ctrl+B'),
        createButton('italic', 'I', '斜体', 'Ctrl+I'),
        createButton('strikethrough', 'S', '删除线', 'Ctrl+D')
      ];
    },

    // 清理插件
    destroy: () => {
      plugin.api = undefined;
    }
  };

  return plugin;
};
