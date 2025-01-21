// src/core/parser/mockParser.ts
import type {
  ParserOptions,
  ParseResult,
  ContentChange,
  TocResult,
  SupportedFeatures
} from "@/types/editor";

// 定义 Markdown 解析器接口
export interface IMarkdownParser {
  // 解析完整的 Markdown 内容
  parse(content: string, options?: ParserOptions): ParseResult;

  // 增量解析变更的内容（用于提高性能）
  parseIncremental(
    content: string,
    changes: ContentChange[],
    options?: ParserOptions
  ): ParseResult;

  // 获取文档目录结构
  getTableOfContents(content: string): TocResult;

  // 获取解析器支持的特性列表
  getSupportedFeatures(): SupportedFeatures;
}

// 模拟的 Markdown 解析器实现
export class MockMarkdownParser implements IMarkdownParser {
  // 解析完整的 Markdown 内容
  // 这里使用简单的实现来模拟真实解析过程
  parse(content: string, options?: ParserOptions): ParseResult {
    // 简单的模拟转换逻辑
    const html = content
      .split('\n')
      .map(line => {
        // 处理一级标题
        if (line.startsWith('# ')) {
          return `<h1>${line.slice(2)}</h1>`;
        }
        // 处理二级标题
        if (line.startsWith('## ')) {
          return `<h2>${line.slice(3)}</h2>`;
        }
        // 处理代码块开始
        if (line.startsWith('```')) {
          return '<pre><code>';
        }
        // 其他行作为段落处理
        return `<p>${line}</p>`;
      })
      .join('\n');

    // 返回解析结果
    return {
      html,                    // 转换后的HTML
      codeBlocks: [],         // 代码块信息（这里暂时为空）
      meta: {                 // 文档元数据
        wordCount: content.split(/\s+/).length,  // 简单的词数统计
        statistics: {         // 文档统计信息
          codeBlocks: 0,     // 代码块数量
          images: 0,         // 图片数量
          links: 0,          // 链接数量
          tables: 0          // 表格数量
        }
      },
      warnings: []           // 解析警告信息
    };
  }

  // 增量解析方法
  // 在实际实现中，这个方法应该只解析发生变化的部分
  // 这里为了简单起见，直接调用完整解析方法
  parseIncremental(
    content: string,
    changes: ContentChange[],
    options?: ParserOptions
  ): ParseResult {
    // 目前仅调用完整解析方法
    // 实际实现时应该根据 changes 信息只解析变更部分
    return this.parse(content, options);
  }

  // 获取文档目录结构
  // 通过分析文档中的标题来生成目录
  getTableOfContents(content: string): TocResult {
    // 查找所有标题行并生成目录项
    const headings = content
      .split('\n')
      .filter(line => line.startsWith('#'))  // 筛选标题行
      .map((line, index) => ({
        text: line.replace(/^#+\s/, ''),     // 提取标题文本
        level: (line.match(/^#+/) || [''])[0].length,  // 计算标题级别
        id: `heading-${index}`,              // 生成唯一ID
        position: index,                     // 记录位置
        children: []                         // 子标题（这里未实现嵌套）
      }));

    // 返回目录结构
    return {
      items: headings,  // 目录项列表
      meta: {
        maxDepth: Math.max(...headings.map(h => h.level)),  // 最大标题深度
        totalHeadings: headings.length                      // 总标题数
      }
    };
  }

  // 获取解析器支持的特性
  // 返回支持的编程语言和Markdown功能列表
  getSupportedFeatures(): SupportedFeatures {
    return {
      // 支持的编程语言列表
      languages: [
        {
          id: 'javascript',           // 语言标识符
          name: 'JavaScript',         // 显示名称
          aliases: ['js'],           // 别名
          version: '1.0.0'           // 版本号
        }
      ],
      // 支持的Markdown特性
      markdownFeatures: [
        'headers',    // 标题
        'bold',      // 加粗
        'italic',    // 斜体
        'lists'      // 列表
      ]
    };
  }
}

// 解析器单例模式实现
let parserInstance: IMarkdownParser | null = null;

// 获取解析器实例的工厂函数
// 确保整个应用中只创建一个解析器实例
export const getParserInstance = (): IMarkdownParser => {
  if (!parserInstance) {
    parserInstance = new MockMarkdownParser();
  }
  return parserInstance;
};
