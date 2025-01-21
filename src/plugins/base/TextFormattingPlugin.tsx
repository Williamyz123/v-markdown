// src/plugins/base/TextFormattingPlugin.tsx
import React from 'react';
import type { Plugin, EditorAPI } from '@/types/plugin';
import type { Command } from '@/core/commands/CommandSystem';
// import { calculatePosition } from '@/utils/editorUtils';

// 工具栏按钮的属性接口定义
interface ToolbarButtonProps {
  icon: string;      // 按钮图标
  title: string;     // 按钮标题
  onClick: () => void; // 点击事件处理函数
  isActive?: boolean;  // 按钮是否处于激活状态
}

// 工具栏按钮组件
// 用于渲染各种格式化操作的按钮（如加粗、斜体等）
const ToolbarButton: React.FC<ToolbarButtonProps> = ({
                                                       icon,
                                                       title,
                                                       onClick,
                                                       isActive
                                                     }) => (
  <button
    className={`toolbar-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
    title={title}
  >
    <span className="button-content">{title}</span>
  </button>
);

// 创建文本格式化命令的工厂函数
// 接收编辑器API作为参数，返回一组文本格式化命令
const createTextFormattingCommands = (api: EditorAPI): Command[] => {
  // 创建单个格式化命令的辅助函数
  const createFormatCommand = (
    id: string,          // 命令ID
    marker: string,      // Markdown标记符号（如 ** 用于加粗）
    markerLength: number // 标记符号的长度
  ): Command => ({
    id,
    // 执行命令的函数
    execute: () => {
      // 获取当前编辑器内容和选区
      const content = api.editor.getContent();
      const selection = api.editor.getSelection();

      // 如果没有选中文本，则不执行操作
      if (selection.start === selection.end) return;

      // 将文本分为三部分：选区前、选中内容、选区后
      const before = content.slice(0, selection.start);
      const selected = content.slice(selection.start, selection.end);
      const after = content.slice(selection.end);

      // 注：这里暂时注释掉了位置计算的代码
      // const startPos = calculatePosition(content, selection.start);
      // const endPos = calculatePosition(content, selection.end);

      // 构造新的文本内容，在选中文本两侧添加标记符号
      const newContent = `${before}${marker}${selected}${marker}${after}`;
      api.editor.setContent(newContent);

      // 更新选区位置，考虑添加的标记符号长度
      const newEnd = selection.end + (markerLength * 2);
      api.editor.setSelection(selection.start, newEnd);
    },
    // 判断命令是否可用（需要有文本被选中）
    isEnabled: () => {
      const selection = api.editor.getSelection();
      return selection.start !== selection.end;
    }
  });

  // 返回所有支持的格式化命令
  return [
    createFormatCommand('bold', '**', 2),          // 加粗命令
    createFormatCommand('italic', '*', 1),         // 斜体命令
    createFormatCommand('strikethrough', '~~', 2)  // 删除线命令
  ];
};

// 创建文本格式化插件的工厂函数
export const createTextFormattingPlugin = (): Plugin => {
  // 保存插件API的引用
  let pluginApi: EditorAPI | null = null;

  // 返回插件对象
  return {
    id: 'textFormatting',
    name: 'Text Formatting',
    description: '提供基本的文本格式化功能',
    version: '1.0.0',

    // 插件初始化函数
    initialize: (api: EditorAPI) => {
      console.log('初始化文本格式化插件');
      pluginApi = api;
      // 创建并注册所有格式化命令
      const commands = createTextFormattingCommands(api);
      commands.forEach(command => {
        api.commands.registerCommand(command);
      });
    },

    // 渲染工具栏按钮
    renderToolbarItems: () => {
      console.log('调用渲染工具栏项方法');
      // 如果插件未初始化，返回空数组
      if (!pluginApi) {
        console.warn('插件API未初始化');
        return [];
      }

      // 获取当前选区状态
      const selection = pluginApi.editor.getSelection();
      const hasSelection = selection.start !== selection.end;
      console.log('当前选区状态：', { selection, hasSelection });

      // 创建工具栏按钮的辅助函数
      const createButton = (
        key: string,     // 按钮唯一标识
        icon: string,    // 按钮图标
        title: string,   // 按钮标题
        shortcut: string // 快捷键提示
      ) => (
        <ToolbarButton
          key={key}
          icon={icon}
          title={`${title} (${shortcut})`}
          onClick={() => pluginApi?.commands.executeCommand(key)}
          isActive={hasSelection}
        />
      );

      // 返回所有格式化按钮
      return [
        createButton('bold', 'bold', '加粗', 'Ctrl+B'),
        createButton('italic', 'italic', '斜体', 'Ctrl+I'),
        createButton('strikethrough', 'strikethrough', '删除线', 'Ctrl+S')
      ];
    },

    // 插件清理函数
    destroy: () => {
      pluginApi = null;
    }
  };
};
