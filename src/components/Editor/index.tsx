// src/components/Editor/index.tsx
import React, { useEffect, useRef } from 'react';
import { usePlugins } from '@/plugins/core/PluginContext';
import { createTextFormattingPlugin } from '@/plugins/base/TextFormattingPlugin';
import { Toolbar } from '../Toolbar';
import { EditArea } from '../EditArea';
import { PreviewArea } from '../PreviewArea';
import {createCorePlugin} from "@/plugins/base/CorePlugin";
import {createExportPlugin} from "@/plugins/base/ExportPlugin";

const Editor: React.FC = () => {
  const { registerPlugin } = usePlugins();
  // 初始化插件
  useEffect(() => {
    // 注册核心插件
    const corePlugin = createCorePlugin();
    registerPlugin(corePlugin);
    console.log('Core plugin registered with ID:', corePlugin.id);

    // 注册文本格式化插件
    const textFormattingPlugin = createTextFormattingPlugin();
    registerPlugin(textFormattingPlugin);
    console.log('Text formatting plugin registered with ID:', textFormattingPlugin.id);

    // 注册导出插件
    const exportPlugin = createExportPlugin();
    registerPlugin(exportPlugin);
  }, [registerPlugin]);

  return (
    <div className="markdown-editor">
      <Toolbar />
      <div className="editor-main">
        <EditArea />
        <PreviewArea />
      </div>
    </div>
  );
};

export default Editor;
