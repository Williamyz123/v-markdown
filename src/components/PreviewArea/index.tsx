// src/components/PreviewArea/index.tsx
import React from 'react';
import { useEditor } from '@/core/editor/EditorContext';
import { useStyles } from '@/styles/core/StyleContext';

export const PreviewArea: React.FC = () => {
  const { state } = useEditor();
  const { codeTheme } = useStyles();

  return (
    <div
      className="preview-area"
      data-code-theme={codeTheme}
      dangerouslySetInnerHTML={{
        __html: state.parseResult?.html || ''
      }}
    />
  );
};
