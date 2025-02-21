// src/plugins/base/ExportPlugin.tsx
import React from 'react';
import type { Plugin, EditorAPI } from '@/types/plugin';
import type { Command } from '@/core/commands/CommandSystem';
import { ToolbarButton } from '@/components/Toolbar/ToolbarButton';
import { ExportPDFIcon, ExportHTMLIcon } from '@/components/Toolbar/icons';
import { useStyles } from '@/styles/StyleContext';
import html2pdf from 'html2pdf.js';

// PDF配置选项
const pdfOptions = {
  margin: [10, 10],
  filename: 'exported_markdown.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    letterRendering: true
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  }
};

// 从主题变量中获取样式
function getThemeStyles(theme: string, codeTheme: string) {
  // 这些变量需要和 _variables.scss 中的定义保持一致
  const themes = {
    'light': {
      'bg': '#ffffff',
      'text': '#333333',
      'border': '#e0e0e0',
      'toolbar-bg': '#f5f5f5',
      'editor-bg': '#ffffff',
      'preview-bg': '#ffffff',
      'icon': '#666666'
    },
    'dark': {
      'bg': '#1e1e1e',
      'text': '#d4d4d4',
      'border': '#424242',
      'toolbar-bg': '#2d2d2d',
      'editor-bg': '#1e1e1e',
      'preview-bg': '#1e1e1e',
      'icon': '#aaaaaa'
    }
  };

  const codeThemes = {
    'github': {
      'bg': '#f6f8fa',
      'text': '#24292e',
      'keyword': '#d73a49',
      'string': '#032f62',
      'comment': '#6a737d',
      'function': '#6f42c1',
      'number': '#005cc5',
      'operator': '#d73a49',
      'class-name': '#6f42c1',
      'builtin': '#005cc5'
    },
    'monokai': {
      'bg': '#272822',
      'text': '#f8f8f2',
      'keyword': '#f92672',
      'string': '#e6db74',
      'comment': '#75715e',
      'function': '#a6e22e',
      'number': '#ae81ff',
      'operator': '#f92672',
      'class-name': '#a6e22e',
      'builtin': '#66d9ef'
    }
  };

  const currentTheme = themes[theme as keyof typeof themes] || themes.light;
  const currentCodeTheme = codeThemes[codeTheme as keyof typeof codeThemes] || codeThemes.github;

  return { currentTheme, currentCodeTheme };
}

// 创建导出插件
export const createExportPlugin = (): Plugin => {
  const plugin: Plugin = {
    id: 'export',
    name: 'Export Plugin',
    description: 'Provides export functionality for HTML and PDF',
    version: '1.0.0',
    api: undefined,

    initialize: (api: EditorAPI) => {
      console.log('Initializing ExportPlugin');
      plugin.api = api;

      // 导出HTML命令
      const exportHtmlCommand: Command = {
        id: 'exportHtml',
        execute: () => {
          const content = api.editor.getState().parseResult.html;
          const { currentTheme, currentCodeTheme } = getThemeStyles(
            api.theme.getCurrentTheme(),
            document.querySelector('.preview-area')?.getAttribute('data-code-theme') || 'github'
          );

          const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Exported Markdown</title>
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            line-height: 1.6;
            background-color: ${currentTheme.bg};
            color: ${currentTheme.text};
        }
        pre {
            background-color: ${currentCodeTheme.bg};
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            color: ${currentCodeTheme.text};
        }
        code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        }
        blockquote {
            border-left: 4px solid;
            border-left-color: ${currentTheme.border};
            padding-left: 16px;
            margin: 0;
            color: ${currentTheme.text};
        }
        .token.keyword { color: ${currentCodeTheme.keyword}; }
        .token.string { color: ${currentCodeTheme.string}; }
        .token.comment { color: ${currentCodeTheme.comment}; }
        .token.function { color: ${currentCodeTheme.function}; }
        .token.number { color: ${currentCodeTheme.number}; }
        .token.operator { color: ${currentCodeTheme.operator}; }
        .token.class-name { color: ${currentCodeTheme['class-name']}; }
        .token.builtin { color: ${currentCodeTheme.builtin}; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

          // 创建Blob对象
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'exported_markdown.html';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      };

      // 导出PDF命令
      const exportPdfCommand: Command = {
        id: 'exportPdf',
        execute: async () => {
          console.log('开始导出PDF');
          const content = api.editor.getState().parseResult.html;
          const { currentTheme, currentCodeTheme } = getThemeStyles(
            api.theme.getCurrentTheme(),
            document.querySelector('.preview-area')?.getAttribute('data-code-theme') || 'github'
          );

          // 创建完整的HTML文档结构
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {
                        width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
                        line-height: 1.6;
                        background-color: ${currentTheme.bg};
                        color: ${currentTheme.text};
                    }
                    pre {
                        background-color: ${currentCodeTheme.bg};
                        padding: 16px;
                        border-radius: 6px;
                        overflow-x: auto;
                        margin: 1em 0;
                        color: ${currentCodeTheme.text};
                    }
                    code {
                        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                    }
                    blockquote {
                        border-left: 4px solid;
                        border-left-color: ${currentTheme.border};
                        padding-left: 16px;
                        margin: 0;
                        color: ${currentTheme.text};
                    }
                    .token {
                        display: inline-block;
                    }
                    .token.keyword { color: ${currentCodeTheme.keyword}; }
                    .token.string { color: ${currentCodeTheme.string}; }
                    .token.comment { color: ${currentCodeTheme.comment}; }
                    .token.function { color: ${currentCodeTheme.function}; }
                    .token.number { color: ${currentCodeTheme.number}; }
                    .token.operator { color: ${currentCodeTheme.operator}; }
                    .token.class-name { color: ${currentCodeTheme['class-name']}; }
                    .token.builtin { color: ${currentCodeTheme.builtin}; }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
          `;

          // 创建临时容器并设置内容
          const container = document.createElement('div');
          container.style.visibility = 'hidden';
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '0';
          document.body.appendChild(container);

          // 创建iframe来正确渲染HTML内容
          const iframe = document.createElement('iframe');
          iframe.style.width = '800px';
          iframe.style.height = '0';
          container.appendChild(iframe);

          // 写入完整的HTML内容到iframe
          const iframeDoc = iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            try {
              // 等待样式应用
              await new Promise(resolve => setTimeout(resolve, 500));

              // 使用iframe的body作为PDF源
              await html2pdf()
                .set(pdfOptions)
                .from(iframeDoc.body)
                .save();
            } catch (error) {
              console.error('PDF导出失败:', error);
              alert('PDF导出失败，请稍后重试');
            }
          }

          // 清理临时元素
          document.body.removeChild(container);
        }
      };

      // 注册命令
      [exportHtmlCommand, exportPdfCommand].forEach(command => {
        console.log('Registering command:', command.id);
        api.commands.registerCommand(command);
      });
    },

    // 渲染工具栏项
    renderToolbarItems: () => {
      if (!plugin.api) {
        console.warn('Plugin API not initialized');
        return [];
      }

      return [
        <ToolbarButton
          key="exportHtml"
          icon={<ExportHTMLIcon />}
          title="导出为HTML"
          onClick={() => plugin.api!.commands.executeCommand('exportHtml')}
        />,
        <ToolbarButton
          key="exportPdf"
          icon={<ExportPDFIcon />}
          title="导出为PDF"
          onClick={() => plugin.api!.commands.executeCommand('exportPdf')}
        />
      ];
    }
  };

  return plugin;
};
