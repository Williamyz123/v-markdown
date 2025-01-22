// src/components/EditArea/index.tsx
import React, { ChangeEvent, useRef, useEffect, useCallback, useState } from 'react';
import { useEditor } from '@/core/editor/EditorContext';
import { useKeyboardShortcuts } from './KeyboardHandler';

export const EditArea: React.FC = () => {
  const { state, dispatch, handleContentUpdate } = useEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const [isFocused, setIsFocused] = useState(false);

  // 启用快捷键支持，传入 textareaRef
  useKeyboardShortcuts(textareaRef);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleContentUpdate(e.target.value, []);
  };

  // 使用 useCallback 记忆化 handleSelect 函数
  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea && isFocused) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // 只在选区真正改变时才更新
      if (selectionRef.current.start !== start || selectionRef.current.end !== end) {
        selectionRef.current = { start, end };
        console.log('Selection changed:', { start, end });

        dispatch({
          type: 'UPDATE_SELECTION',
          payload: { start, end }
        });
      }
    }
  }, [dispatch, isFocused]);

  // 处理焦点变化
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // 恢复选区
    const textarea = textareaRef.current;
    if (textarea && selectionRef.current.start !== selectionRef.current.end) {
      textarea.setSelectionRange(
        selectionRef.current.start,
        selectionRef.current.end
      );
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // 清除编辑器状态中的选区
    dispatch({
      type: 'UPDATE_SELECTION',
      payload: { start: 0, end: 0 }
    });
  }, [dispatch]);

  // 监听选区更新事件
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 使用 selectionchange 事件替代多个事件监听
      const handleSelectionChange = () => {
        if (document.activeElement === textarea) {
          handleSelect();
        }
      };

      // 监听全局的 selectionchange 事件
      document.addEventListener('selectionchange', handleSelectionChange);

      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, [handleSelect]);

  // 同步选择状态
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && isFocused && state.selection) {
      const { start, end } = state.selection;
      // 只在选区真正不同时才设置
      if (textarea.selectionStart !== start || textarea.selectionEnd !== end) {
        textarea.setSelectionRange(start, end);
      }
    }
  }, [state.selection, isFocused]);

  return (
    <div className="edit-area">
      <textarea
        ref={textareaRef}
        value={state.content}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full h-full p-4 resize-none"
        placeholder="在这里输入 Markdown 文本..."
      />
    </div>
  );
};
