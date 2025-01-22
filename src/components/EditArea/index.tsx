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
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // 只有在编辑区域获得焦点时才更新选区
      if (isFocused) {
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
    const textarea = textareaRef.current;
    if (textarea) {
      // 恢复之前的选区
      if (selectionRef.current.start !== selectionRef.current.end) {
        textarea.setSelectionRange(
          selectionRef.current.start,
          selectionRef.current.end
        );
      }
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

  // 监听 mouseup 和 keyup 事件以确保选区更新
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const updateSelection = () => handleSelect();

      textarea.addEventListener('mouseup', updateSelection);
      textarea.addEventListener('keyup', updateSelection);

      return () => {
        textarea.removeEventListener('mouseup', updateSelection);
        textarea.removeEventListener('keyup', updateSelection);
      };
    }
  }, [handleSelect]);

  // 同步选择状态
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && isFocused) {
      selectionRef.current = state.selection;
      textarea.setSelectionRange(state.selection.start, state.selection.end);
    }
  }, [state.selection, isFocused]);

  return (
    <div className="edit-area">
      <textarea
        ref={textareaRef}
        value={state.content}
        onChange={handleChange}
        onSelect={handleSelect}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full h-full p-4 resize-none"
        placeholder="在这里输入 Markdown 文本..."
      />
    </div>
  );
};
