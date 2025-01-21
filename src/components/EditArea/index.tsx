// src/components/EditArea/index.tsx
import React, { ChangeEvent } from 'react';
import { useEditor } from '@/core/editor/EditorContext';

export const EditArea: React.FC = () => {
  const { state, handleContentUpdate } = useEditor();

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleContentUpdate(e.target.value, []);
  };

  return (
    <div className="edit-area">
      <textarea
        value={state.content}
        onChange={handleChange}
        className="w-full h-full p-4 resize-none"
        placeholder="在这里输入 Markdown 文本..."
      />
    </div>
  );
};
