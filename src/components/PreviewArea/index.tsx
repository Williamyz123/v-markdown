// src/components/PreviewArea/index.tsx
import React from 'react';
import { useEditor } from '@/core/editor/EditorContext';

export const PreviewArea: React.FC = () => {
  const { state } = useEditor();

  return (
    <div
      className="preview-area p-4"
      dangerouslySetInnerHTML={{ __html: state.parseResult.html }}
    />
  );
};
