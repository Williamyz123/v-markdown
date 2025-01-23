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

  // 监听编辑区域的滚动事件
  useEffect(() => {
    const handleEditorScroll = (e: Event) => {
      const customEvent = e as CustomEvent;
      const percentage = customEvent.detail.percentage;

      if (previewRef.current) {
        const previewElement = previewRef.current;
        const scrollHeight = previewElement.scrollHeight - previewElement.clientHeight;
        previewElement.scrollTop = scrollHeight * percentage;
      }
    };

    window.addEventListener('editorScroll', handleEditorScroll);

    return () => {
      window.removeEventListener('editorScroll', handleEditorScroll);
    };
  }, []);

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
