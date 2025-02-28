# Markdown编辑器使用文档

## 项目概述

这是一个基于React的现代化Markdown编辑器，提供实时预览、多主题支持、代码高亮以及HTML和PDF导出功能。编辑器具有插件化架构，支持快捷键操作，并提供自动保存功能，确保您的内容不会丢失。

## 系统要求

- 现代浏览器（Chrome, Firefox, Safari, Edge等最新版本）
- Node.js v14.0.0或更高版本（用于开发）
- npm v6.0.0或更高版本（用于开发）

## 安装指南

### 用户安装

1. 克隆仓库：
```bash
git clone https://github.com/Williamyz123/v-markdown.git
cd v-markdown
```

2. 安装依赖：
```bash
npm install
```

3. 启动应用：
```bash
npm start
```

4. 打开浏览器，访问 `http://localhost:3000`

## 项目结构

```
src/
├── components/       # UI组件
│   ├── EditArea/     # 编辑区域组件
│   ├── Toolbar/      # 工具栏组件
│   └── ...
├── core/             # 核心逻辑
│   ├── commands/     # 命令系统
│   ├── editor/       # 编辑器核心
│   └── parser/       # Markdown解析器
├── plugins/          # 插件系统
│   ├── base/         # 基础插件
│   └── core/         # 插件核心逻辑
├── styles/           # 样式文件
│   ├── abstracts/    # 变量和混合宏
│   ├── components/   # 组件样式
│   └── ...
└── types/            # TypeScript类型定义
```

## 功能特性

### 基本编辑功能

- Markdown语法支持（标题、粗体、斜体、列表、链接等）
- 实时预览
- 撤销/重做历史
- 自动保存

### 格式化工具

- 文本格式化（粗体、斜体、删除线）
- 标题（H1, H2, H3）
- 列表（有序、无序）
- 引用块
- 水平线
- 链接和图片插入
- 表格插入

### 主题支持

- 浅色主题
- 深色主题
- 代码块主题（GitHub、Monokai）

### 导出功能

- 导出为HTML
- 导出为PDF

### 快捷键

- 撤销：`Ctrl+Z`
- 重做：`Ctrl+Shift+Z` 或 `Ctrl+Y`
- 复制：`Ctrl+C`
- 粗体：`Ctrl+B`
- 斜体：`Ctrl+I`
- 删除线：`Ctrl+D`

## 使用指南

### 基本操作

1. **开始编辑**：在左侧编辑区直接输入Markdown文本
2. **实时预览**：右侧区域自动显示渲染后的内容
3. **格式化**：使用工具栏按钮或快捷键应用格式
4. **主题切换**：使用右上角的下拉菜单切换编辑器和代码主题

### 文本格式化

- **加粗文本**：选中文本，点击加粗按钮或按`Ctrl+B`
- **斜体文本**：选中文本，点击斜体按钮或按`Ctrl+I`
- **添加标题**：点击标题按钮(H1, H2, H3)
- **创建列表**：点击无序或有序列表按钮
- **插入链接**：点击链接按钮，输入URL
- **插入图片**：点击图片按钮，输入图片URL
- **插入表格**：点击表格按钮插入表格模板

### 导出文档

1. 点击工具栏上的HTML导出按钮，将文档保存为HTML文件
2. 点击工具栏上的PDF导出按钮，将文档转换为PDF文件并下载

### 自动保存

编辑器会自动保存您的内容到浏览器的本地存储中。关闭或刷新页面后，您的内容不会丢失。

## 样式与主题

### 编辑器主题

- **浅色主题（Light）**：默认主题，适合日间使用
- **深色主题（Dark）**：减少眼睛疲劳，适合夜间使用

### 代码块主题

- **GitHub**：类似GitHub代码风格的亮色主题
- **Monokai**：流行的深色代码主题

切换主题：使用右上角的主题选择器下拉菜单

## 开发者指南

### 插件开发

编辑器支持插件系统，您可以开发自定义插件扩展功能：

1. 创建插件文件：
```typescript
// src/plugins/custom/MyCustomPlugin.tsx
import React from 'react';
import type { Plugin, EditorAPI } from '@/types/plugin';

export const createMyCustomPlugin = (): Plugin => {
  const plugin: Plugin = {
    id: 'myCustomPlugin',
    name: 'My Custom Plugin',
    description: '自定义插件示例',
    version: '1.0.0',
    api: undefined,

    initialize: (api: EditorAPI) => {
      plugin.api = api;
      // 初始化逻辑
    },

    renderToolbarItems: () => {
      // 返回工具栏项
      return [];
    }
  };

  return plugin;
};
```

2. 在插件注册处添加您的插件：
```typescript
// 在src/components/Editor/index.tsx注册您的插件
import { createMyCustomPlugin } from './custom/MyCustomPlugin';
// ...
registerPlugin(createMyCustomPlugin());
```

### 样式自定义

编辑器使用SCSS进行样式管理：

1. 主题变量位于 `src/styles/abstracts/_variables.scss`
2. 组件样式位于 `src/styles/components/` 目录

要自定义样式，建议：
- 修改 `_variables.scss` 中的主题配置
- 在特定组件的样式文件中进行更改
- 添加新的主题配置

