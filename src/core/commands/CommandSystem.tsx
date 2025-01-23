// src/core/commands/CommandSystem.tsx
import { useRef, useCallback } from 'react';

export interface Command {
  id: string;
  execute: () => void;
  undo?: () => void;
  isEnabled?: () => boolean;
  shortcut?: string;
}

export function useCommands() {
  const commandsRef = useRef(new Map<string, Command>());

  const registerCommand = useCallback((command: Command) => {
    console.log('注册命令:', command.id);
    commandsRef.current.set(command.id, command);
  }, []);

  const executeCommand = useCallback((commandId: string) => {
    console.log('尝试执行命令:', commandId);
    const command = commandsRef.current.get(commandId);
    if (command?.isEnabled?.() !== false) {
      command?.execute();
    }
  }, []);

  const isEnabled = useCallback((commandId: string) => {
    const command = commandsRef.current.get(commandId);
    return command?.isEnabled?.() !== false;
  }, []);

  return {
    registerCommand,
    executeCommand,
    isEnabled
  };
}
