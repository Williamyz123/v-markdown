// src/components/PreviewArea/index.tsx
import React, { useEffect, useRef } from 'react';
import { useEditor } from '@/core/editor/EditorContext';
import { useStyles } from '@/styles/StyleContext';

export const PreviewArea: React.FC = () => {
  const { state } = useEditor();
  const { codeTheme } = useStyles();
  const previewRef = useRef<HTMLDivElement>(null);
  // 标记是否由编辑区触发的滚动
  const isEditorScrollingRef = useRef(false);

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
        // 标记当前滚动是由编辑区域触发的
        isEditorScrollingRef.current = true;

        const previewElement = previewRef.current;
        const scrollHeight = previewElement.scrollHeight - previewElement.clientHeight;
        previewElement.scrollTop = scrollHeight * percentage;

        // 重置标记
        setTimeout(() => {
          isEditorScrollingRef.current = false;
        }, 50);
      }
    };

    window.addEventListener('editorScroll', handleEditorScroll);

    return () => {
      window.removeEventListener('editorScroll', handleEditorScroll);
    };
  }, []);

  // 处理预览区域的滚动事件
  const handlePreviewScroll = () => {
    // 如果当前滚动是由编辑区域触发的，不需要再触发事件
    if (isEditorScrollingRef.current || !previewRef.current) return;

    const previewElement = previewRef.current;
    const scrollPercentage = previewElement.scrollTop / (previewElement.scrollHeight - previewElement.clientHeight);

    // 触发自定义事件，通知编辑区域滚动
    const scrollEvent = new CustomEvent('previewScroll', {
      detail: { percentage: scrollPercentage }
    });
    window.dispatchEvent(scrollEvent);
  };

  return (
    <div
      ref={previewRef}
      className="preview-area"
      dangerouslySetInnerHTML={{
        __html: state.parseResult?.html || ''
      }}
      onScroll={handlePreviewScroll}
    />
  );
};
