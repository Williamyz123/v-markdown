// src/components/PreviewArea/index.tsx
import React, { useEffect, useRef } from 'react';
import { useEditor } from '@/core/editor/EditorContext';
import { useStyles } from '@/styles/StyleContext';

export const PreviewArea: React.FC = () => {
  const { state } = useEditor();
  const { codeTheme } = useStyles();
  const previewRef = useRef<HTMLDivElement>(null);

  // 监听主题变化，更新代码块的主题
  useEffect(() => {
    if (previewRef.current) {
      const codeBlocks = previewRef.current.querySelectorAll('pre');
      codeBlocks.forEach(block => {
        block.setAttribute('data-code-theme', codeTheme);
      });
    }
  }, [codeTheme, state.parseResult?.html]);

  return (
    <div
      ref={previewRef}
      className="preview-area"
      dangerouslySetInnerHTML={{
        __html: state.parseResult?.html || ''
      }}
    />
  );
};
