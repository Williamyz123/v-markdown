// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Editor from './components/Editor';
import { EditorProvider } from '@/core/editor/EditorContext';
import { PluginProvider } from '@/plugins/core/PluginContext';
import { StyleProvider } from '@/styles/StyleContext';
import './styles/main.scss';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <EditorProvider>
    <PluginProvider>
      <StyleProvider>
        <Editor />
      </StyleProvider>
    </PluginProvider>
  </EditorProvider>
);
