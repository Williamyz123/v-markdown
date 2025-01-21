// src/core/commands/CommandSystem.tsx
import { useRef, useCallback} from 'react';
// import { useEditor } from '../editor/EditorContext';

// 命令接口定义：描述一个可执行的编辑器命令
export interface Command {
  id: string;                   // 命令的唯一标识符
  execute: () => void;          // 命令的执行函数
  undo?: () => void;           // 可选的撤销函数
  isEnabled?: () => boolean;   // 可选的命令启用状态检查函数
  shortcut?: string;           // 可选的键盘快捷键
}

// 创建命令系统Hook：管理编辑器的所有命令
export function useCommands() {
  // 获取编辑器上下文中的状态和内容更新函数
  // const { state, handleContentUpdate } = useEditor();
  // 使用 useRef 存储命令映射表，确保在重渲染时保持引用不变
  const commandsRef = useRef(new Map<string, Command>());

  // 注册新命令的函数
  const registerCommand = useCallback((command: Command) => {
    commandsRef.current.set(command.id, command);
  }, []);

  // 执行指定命令的函数
  const executeCommand = useCallback((commandId: string) => {
    const command = commandsRef.current.get(commandId);
    // 检查命令是否存在且启用，然后执行
    if (command?.isEnabled?.() !== false) {
      command?.execute();
    }
  }, []);

  // // 在组件挂载时注册基础命令
  // useEffect(() => {
  //   // 注册加粗命令示例
  //   registerCommand({
  //     id: 'bold',                 // 命令ID：加粗
  //     shortcut: 'ctrl+b',         // 快捷键：Ctrl+B
  //     execute: () => {
  //       // 获取当前内容和选区
  //       const { content, selection } = state;
  //       const before = content.slice(0, selection.start);       // 选区前的内容
  //       const selected = content.slice(selection.start, selection.end); // 选中的内容
  //       const after = content.slice(selection.end);             // 选区后的内容
  //
  //       // 计算选区开始和结束位置的行列信息
  //       const startPos = calculatePosition(content, selection.start);
  //       const endPos = calculatePosition(content, selection.end);
  //
  //       // 构造新内容：在选中文本两侧添加加粗标记
  //       const newContent = `${before}**${selected}**${after}`;
  //       // 更新编辑器内容，并提供变更信息用于增量解析
  //       handleContentUpdate(newContent, [{
  //         start: {
  //           offset: selection.start,
  //           line: startPos.line,
  //           column: startPos.column
  //         },
  //         end: {
  //           offset: selection.end,
  //           line: endPos.line,
  //           column: endPos.column
  //         },
  //         text: `**${selected}**`
  //       }]);
  //     },
  //     // 仅在有文本选中时启用加粗命令
  //     isEnabled: () => state.selection.start !== state.selection.end
  //   });
  //
  //   // 此处可以继续注册其他基础命令...
  // }, [registerCommand, state, handleContentUpdate]);
  //
  // // 处理键盘快捷键的函数
  // const handleKeyDown = useCallback((event: KeyboardEvent) => {
  //   // 获取所有设置了快捷键的命令
  //   const shortcuts = Array.from(commandsRef.current.values())
  //     .filter(cmd => cmd.shortcut);
  //
  //   // 检查是否有匹配的快捷键命令
  //   for (const command of shortcuts) {
  //     if (isShortcutMatch(event, command.shortcut!)) {
  //       event.preventDefault();  // 阻止默认行为
  //       executeCommand(command.id);  // 执行匹配的命令
  //       break;
  //     }
  //   }
  // }, [executeCommand]);
  //
  // // 设置和清理键盘事件监听器
  // useEffect(() => {
  //   document.addEventListener('keydown', handleKeyDown);
  //   // 清理函数：组件卸载时移除事件监听器
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, [handleKeyDown]);

  // 返回命令系统的公共接口
  return {
    registerCommand,
    executeCommand
  };
}

// // 辅助函数：检查键盘事件是否匹配指定的快捷键
// function isShortcutMatch(event: KeyboardEvent, shortcut: string): boolean {
//   // 将快捷键字符串转换为小写并分割为数组
//   const keys = shortcut.toLowerCase().split('+');
//   // 获取当前按下的修饰键和普通键
//   const pressedKeys = [
//     event.ctrlKey && 'ctrl',
//     event.shiftKey && 'shift',
//     event.altKey && 'alt',
//     event.key.toLowerCase()
//   ].filter(Boolean);
//
//   // 检查按下的键是否完全匹配快捷键定义
//   return keys.length === pressedKeys.length &&
//     keys.every(key => pressedKeys.includes(key));
// }
//
// // 添加一个计算位置信息的辅助函数
// function calculatePosition(content: string, offset: number): { line: number; column: number } {
//   // 获取从开始到 offset 的文本
//   const textBeforeOffset = content.slice(0, offset);
//   // 分割成行
//   const lines = textBeforeOffset.split('\n');
//   // 行号就是行数减1（因为从0开始计数）
//   const line = lines.length - 1;
//   // 列号就是最后一行的长度
//   const column = lines[lines.length - 1].length;
//
//   return { line, column };
// }
