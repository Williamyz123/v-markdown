// src/components/EditArea/index.tsx
import React, { ChangeEvent, useRef, useEffect, useCallback } from 'react';
import { useEditor } from '@/core/editor/EditorContext';

export const EditArea: React.FC = () => {
  const { state, dispatch, handleContentUpdate } = useEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleContentUpdate(e.target.value, []);
  };

  // 使用 useCallback 记忆化 handleSelect 函数
  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // 保存选区到 ref 中
      selectionRef.current = { start, end };

      console.log('Selection changed:', { start, end });

      dispatch({
        type: 'UPDATE_SELECTION',
        payload: { start, end }
      });
    }
  }, [dispatch]);

  // 监听 mouseup 和 keyup 事件以确保选区更新
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const updateSelection = () => handleSelect();

      // Focus 事件处理
      const handleFocus = () => {
        // 当文本框重新获得焦点时，恢复之前的选区
        if (selectionRef.current.start !== selectionRef.current.end) {
          textarea.setSelectionRange(
            selectionRef.current.start,
            selectionRef.current.end
          );
        }
      };

      textarea.addEventListener('mouseup', updateSelection);
      textarea.addEventListener('keyup', updateSelection);
      textarea.addEventListener('focus', handleFocus);

      return () => {
        textarea.removeEventListener('mouseup', updateSelection);
        textarea.removeEventListener('keyup', updateSelection);
        textarea.removeEventListener('focus', handleFocus);
      };
    }
  }, [handleSelect]);

  // 同步选择状态
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && document.activeElement === textarea) {
      selectionRef.current = state.selection;
      textarea.setSelectionRange(state.selection.start, state.selection.end);
    }
  }, [state.selection]);

  return (
    <div className="edit-area">
      <textarea
        ref={textareaRef}
        value={state.content}
        onChange={handleChange}
        onSelect={handleSelect}
        className="w-full h-full p-4 resize-none"
        placeholder="在这里输入 Markdown 文本..."
      />
    </div>
  );
};
