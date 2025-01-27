// src/plugins/base/TextFormattingPlugin.tsx
import React from 'react';
import type { Plugin, EditorAPI } from '@/types/plugin';
import type { Command } from '@/core/commands/CommandSystem';
import { ToolbarButton } from '@/components/Toolbar/ToolbarButton';
import { BoldIcon, ItalicIcon, StrikethroughIcon, H1Icon,H2Icon,H3Icon, ListBulletIcon, ListNumberIcon, HorizontalLineIcon, QuoteIcon} from '@/components/Toolbar/icons';

// 工具栏按钮的属性接口
interface ToolbarButtonProps {
  icon: string;
  title: string;
  onClick: () => void;
  isActive?: boolean;
}


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

      // 创建标题命令
      const createHeadingCommand = (level: number): Command => ({
        id: `heading${level}`,
        execute: () => {
          const content = api.editor.getContent();
          const selection = api.editor.getSelection();
          const lines = content.split('\n');
          let currentLineStart = 0;

          // 找到选区所在的行
          for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1; // +1 for newline
            if (currentLineStart <= selection.start && selection.start < currentLineStart + lineLength) {
              // 处理已有的标题标记
              lines[i] = lines[i].replace(/^#{1,6}\s*/, '');
              // 添加新的标题标记
              lines[i] = '#'.repeat(level) + ' ' + lines[i];
              break;
            }
            currentLineStart += lineLength;
          }

          api.editor.setContent(lines.join('\n'));
        },
        isEnabled: () => true
      });

      // 创建列表命令
      const createListCommand = (type: 'bullet' | 'number'): Command => ({
        id: `list${type}`,
        execute: () => {
          const content = api.editor.getContent();
          const selection = api.editor.getSelection();
          const lines = content.split('\n');
          let currentLineStart = 0;
          let currentItem = 1;
          let startLine = -1;
          let endLine = -1;

          // 找到选区开始的行
          for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1;
            if (currentLineStart <= selection.start && selection.start < currentLineStart + lineLength) {
              startLine = i;
            }
            if (currentLineStart <= selection.end && selection.end < currentLineStart + lineLength) {
              endLine = i;
              break;
            }
            currentLineStart += lineLength;
          }

          // 如果没有找到结束行，就用最后一行
          if (endLine === -1) {
            endLine = lines.length - 1;
          }

          // 对选中范围内的每一行应用列表标记
          for (let i = startLine; i <= endLine; i++) {
            // 忽略空行
            if (lines[i].trim() === '') continue;

            // 移除现有的列表标记
            lines[i] = lines[i].replace(/^(\d+\.|-|\*)\s*/, '');

            // 添加新的列表标记
            const marker = type === 'bullet' ? '- ' : `${currentItem}. `;
            lines[i] = marker + lines[i].trim();
            currentItem++;
          }

          // 更新内容
          api.editor.setContent(lines.join('\n'));

          // 更新选区到整个列表范围
          const newSelectionStart = lines.slice(0, startLine).join('\n').length + (startLine > 0 ? 1 : 0);
          const newSelectionEnd = lines.slice(0, endLine + 1).join('\n').length;
          api.editor.setSelection(newSelectionStart, newSelectionEnd);
        },
        isEnabled: () => true
      });

      // 创建引用命令
      const createQuoteCommand = (): Command => ({
        id: 'quote',
        execute: () => {
          const content = api.editor.getContent();
          const selection = api.editor.getSelection();
          const lines = content.split('\n');
          let currentLineStart = 0;
          let startLine = -1;
          let endLine = -1;

          // 找到选区范围内的所有行
          for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1;
            if (currentLineStart <= selection.start && selection.start < currentLineStart + lineLength) {
              startLine = i;
            }
            if (currentLineStart <= selection.end && selection.end < currentLineStart + lineLength) {
              endLine = i;
              break;
            }
            currentLineStart += lineLength;
          }

          // 如果没有找到结束行，就用最后一行
          if (endLine === -1) {
            endLine = lines.length - 1;
          }

          // 对选中范围内的每一行应用引用标记
          for (let i = startLine; i <= endLine; i++) {
            // 移除已有的引用标记
            lines[i] = lines[i].replace(/^>\s*/, '');
            // 添加新的引用标记
            lines[i] = '> ' + lines[i];
          }

          // 更新内容
          api.editor.setContent(lines.join('\n'));

          // 更新选区到整个引用范围
          const newSelectionStart = lines.slice(0, startLine).join('\n').length + (startLine > 0 ? 1 : 0);
          const newSelectionEnd = lines.slice(0, endLine + 1).join('\n').length;
          api.editor.setSelection(newSelectionStart, newSelectionEnd);
        },
        isEnabled: () => true
      });

      // 创建水平线命令
      const createHorizontalLineCommand = (): Command => ({
        id: 'horizontalLine',
        execute: () => {
          const content = api.editor.getContent();
          const selection = api.editor.getSelection();
          const lines = content.split('\n');
          let currentLineStart = 0;
          let targetLine = -1;

          // 找到光标所在的行
          for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1;
            if (currentLineStart <= selection.start && selection.start < currentLineStart + lineLength) {
              targetLine = i;
              break;
            }
            currentLineStart += lineLength;
          }

          if (targetLine !== -1) {
            // 在当前行插入水平线
            const linesBefore = lines.slice(0, targetLine);
            const linesAfter = lines.slice(targetLine);
            const newLines = [...linesBefore, '---', ...linesAfter];

            // 更新内容
            api.editor.setContent(newLines.join('\n'));

            // 将光标移动到水平线的下一行
            const newPosition = newLines.slice(0, targetLine + 2).join('\n').length + 1;
            api.editor.setSelection(newPosition, newPosition);
          }
        },
        isEnabled: () => true
      });


      // 注册格式化命令
      const formatCommands: Command[] = [
        createFormatCommand('bold', '**', 2),
        createFormatCommand('italic', '*', 1),
        createFormatCommand('strikethrough', '~~', 2)
      ];
      formatCommands.forEach(command => api.commands.registerCommand(command));

      // 注册标题命令
      for (let level = 1; level <= 3; level++) {
        api.commands.registerCommand(createHeadingCommand(level));
      }

      // 注册列表命令
      api.commands.registerCommand(createListCommand('bullet'));
      api.commands.registerCommand(createListCommand('number'));

      // 注册引用和水平线命令
      api.commands.registerCommand(createQuoteCommand());
      api.commands.registerCommand(createHorizontalLineCommand());


      console.log('文本格式化插件初始化完成');
    },

    // 渲染工具栏按钮
    renderToolbarItems: () => {
      if (!plugin.api) {
        console.warn('插件API未初始化');
        return [];
      }

      const createButton = (commandId: string, icon: React.ReactNode, title: string, shortcut: string) => {
        const handleClick = () => {
          plugin.api!.commands.executeCommand(commandId);
        };

        return (
          <ToolbarButton
            key={commandId}
            icon={icon}
            title={`${title} (${shortcut})`}
            onClick={handleClick}
            isActive={false}
          />
        );
      };

      // 添加新的工具栏按钮
      return [
        // 现有的格式化按钮
        <ToolbarButton
          key="bold"
          icon={<BoldIcon />}
          title="加粗 (Ctrl+B)"
          onClick={() => plugin.api!.commands.executeCommand('bold')}
        />,
        <ToolbarButton
          key="italic"
          icon={<ItalicIcon />}
          title="斜体 (Ctrl+I)"
          onClick={() => plugin.api!.commands.executeCommand('italic')}
        />,
        <ToolbarButton
          key="strikethrough"
          icon={<StrikethroughIcon />}
          title="删除线 (Ctrl+D)"
          onClick={() => plugin.api!.commands.executeCommand('strikethrough')}
        />,
        // 添加标题按钮
        <ToolbarButton
          key="h1"
          icon={<H1Icon />}
          title="一级标题"
          onClick={() => plugin.api!.commands.executeCommand('heading1')}
        />,
        // 添加标题按钮
        <ToolbarButton
          key="h2"
          icon={<H2Icon />}
          title="二级标题"
          onClick={() => plugin.api!.commands.executeCommand('heading2')}
        />,
        // 添加标题按钮
        <ToolbarButton
          key="h3"
          icon={<H3Icon />}
          title="三级标题"
          onClick={() => plugin.api!.commands.executeCommand('heading3')}
        />,
        // 添加列表按钮
        <ToolbarButton
          key="bulletList"
          icon={<ListBulletIcon />}
          title="无序列表"
          onClick={() => plugin.api!.commands.executeCommand('listbullet')}
        />,
        <ToolbarButton
          key="quote"
          icon={<QuoteIcon />}
          title="引用"
          onClick={() => plugin.api!.commands.executeCommand('quote')}
        />,
        // 添加引用按钮
        <ToolbarButton
          key="horizontalLine"
          icon={<HorizontalLineIcon />}
          title="水平线"
          onClick={() => plugin.api!.commands.executeCommand('horizontalLine')}
        />
      ];
    },

    // 清理插件
    destroy: () => {
      plugin.api = undefined;
    }
  };

  return plugin;
};
