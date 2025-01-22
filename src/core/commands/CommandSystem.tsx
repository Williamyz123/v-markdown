// src/core/commands/CommandSystem.tsx
import { useRef, useCallback} from 'react';

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
  const commandsRef = useRef(new Map<string, Command>());

  const registerCommand = useCallback((command: Command) => {
    console.log('注册命令:', command.id);
    commandsRef.current.set(command.id, command);
    console.log('当前所有命令:', Array.from(commandsRef.current.keys()));
  }, []);

  const executeCommand = useCallback((commandId: string) => {
    console.log('尝试执行命令:', commandId);
    const command = commandsRef.current.get(commandId);
    if (command) {
      const isEnabled = command.isEnabled?.() !== false;
      console.log('命令可用状态:', isEnabled);
      if (isEnabled) {
        console.log('执行命令:', commandId);
        command.execute();
      } else {
        console.log('命令不可用:', commandId);
      }
    } else {
      console.log('未找到命令:', commandId);
    }
  }, []);

  return {
    registerCommand,
    executeCommand
  };
}
