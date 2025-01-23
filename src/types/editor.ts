// src/types/editor.ts

export type EditorAction =
  | { type: 'UPDATE_CONTENT'; payload: { content: string; parseResult: ParseResult } }
  | { type: 'UPDATE_SELECTION'; payload: { start: number; end: number } }
  | { type: 'UNDO' }
  | { type: 'REDO' };

// 编辑器状态接口
export interface EditorState {
  content: string;
  selection: {
    start: number;
    end: number;
  };
  parseResult: ParseResult;
  history: {
    past: HistoryItem[];
    future: HistoryItem[];
  };
  options: ParserOptions;
}


export interface HistoryItem {
  content: string;
  parseResult: ParseResult;
}

/**
 * interface-2.1
 * 描述文档中发生的具体改动
 */
export interface ContentChange {
  /**
   * 改动的起始位置
   * 对于插入操作，start 和 end 相同
   * 对于删除和替换操作，start 和 end 表示受影响的范围
   */
  start: Position;

  /**
   * 改动的结束位置
   */
  end: Position;

  /**
   * 新插入的文本内容
   * - 如果是插入操作，text 是要插入的内容
   * - 如果是删除操作，text 为空字符串
   * - 如果是替换操作，text 是新的内容
   */
  text: string;
}

/**
 * interface-2.1.1
 * 文档中的位置信息
 */
export interface Position {
  /**
   * 行号（从0开始计数）
   */
  line: number;

  /**
   * 在当前行中的字符位置（从0开始计数）
   */
  column: number;

  /**
   * 从文档开始到当前位置的字符总数
   * 这个值用于快速定位和字符串操作
   */
  offset: number;
}

/**
 * interface-5
 * 解析后的HTML内容
 * 定义了解析器返回的结果结构，包括生成的HTML和相关元数据。
 * 每个代码块都会得到一个唯一的标识符，以便准确应用样式。
 */
export interface ParseResult {
  html: string;

  /**
   * 文档中包含的代码块信息
   */
  codeBlocks: CodeBlock[];

  /**
   * 文档元数据
   */
  meta: DocumentMeta;

  /**
   * 解析过程中的警告信息
   */
  warnings?: ParseWarning[];
}

/**
 * interface-6
 * 功能开关配置
 * 通过配置接口，编辑器可以控制解析器的行为和启用的功能。
 */
export interface ParserOptions {
  features?: {
    /**
     * 基础Markdown语法配置
     * 每个选项默认为 true
     */
    basic?: {
      /**
       * 标题支持 (#, ##, ###)
       */
      headings?: boolean;

      /**
       * 文本样式
       */
      textFormatting?: {
        /**
         * 加粗 (**text**)
         */
        bold?: boolean;

        /**
         * 斜体 (*text*)
         */
        italic?: boolean;

        /**
         * 删除线 (~~text~~)
         */
        strikethrough?: boolean;
      };

      /**
       * 列表支持
       */
      lists?: {
        /**
         * 无序列表 (-, *)
         */
        unordered?: boolean;

        /**
         * 有序列表 (1., 2., 3.)
         */
        ordered?: boolean;
      };

      /**
       * 链接和图片
       */
      media?: {
        /**
         * 链接 [text](url)
         */
        links?: boolean;

        /**
         * 图片 ![alt](url)
         */
        images?: boolean;
      };

      /**
       * 引用块 (>)
       */
      blockquotes?: boolean;

      /**
       * 水平线 (---, ***)
       */
      horizontalRule?: boolean;

      /**
       * 表格支持
       */
      tables?: boolean;
    };

    /**
     * 扩展功能配置
     */
    extensions?: {
      math?: boolean;
      mermaid?: boolean;
      footnotes?: boolean;
      taskLists?: boolean;
    };
  };

  /**
   * 代码块相关配置
   */
  codeBlock?: {
    /**
     * 启用的编程语言列表
     * 设置为 'all' 启用所有支持的语言
     */
    languages?: string[] | 'all';

    /**
     * 语言别名映射
     * 例如: { 'js': 'javascript', 'py': 'python' }
     */
    languageAliases?: Record<string, string>;
  };

  /**
   * 安全相关配置
   */
  security?: {
    allowHtml?: boolean;
    sanitize?: boolean;
  };

  /**
   * 性能相关配置
   */
  performance?: {
    incrementalUpdates?: boolean;
    lazyRendering?: boolean;
  };
}

/**
 * interface-5.1
 * 代码块的唯一标识符
 * 会被添加为HTML元素的data属性：data-code-block-id
 */
export interface CodeBlock {
  id: string;

  /**
   * 编程语言标识符
   */
  language: string;

  /**
   * 在文档中的位置
   */
  position: {
    start: number;
    end: number;
  };

  /**
   * 代码块中的词法标记列表
   */
  tokens: Token[];
}

// interface-5.1.1
export interface Token {
  /**
   * 标记类型，如 'keyword', 'string', 'comment' 等
   */
  type: string;

  /**
   * 标记的原始文本内容
   */
  text: string;

  /**
   * 标记在代码块中的位置
   */
  position: {
    start: number;
    end: number;
  };

  /**
   * 语言特定的额外信息
   */
  meta?: Record<string, any>;
}

// interface-5.2
export interface DocumentMeta {
  wordCount: number;
  statistics: {
    codeBlocks: number;
    images: number;
    links: number;
    tables: number;
  };
}

// interface-5.3
export interface ParseWarning {
  type: 'unsupported-feature' | 'security' | 'performance';
  message: string;
  position?: number;
}

// interface-3.1
export interface TocResult {
  /**
   * 目录项列表
   */
  items: TocItem[];

  /**
   * 目录元数据
   */
  meta: {
    maxDepth: number;
    totalHeadings: number;
  };
}

// interface-3.1.1
export interface TocItem {
  /**
   * 标题文本
   */
  text: string;

  /**
   * 标题层级（1-6）
   */
  level: number;

  /**
   * 用于锚点跳转的ID
   */
  id: string;

  /**
   * 在文档中的位置
   */
  position: number;

  /**
   * 子标题列表
   */
  children: TocItem[];
}

/**
 * interface-4.1
 * 支持的编程语言列表
 */
export interface SupportedFeatures {
  languages: {
    id: string;         // 语言标识符
    name: string;       // 语言显示名称
    aliases: string[];  // 语言别名
    version: string;    // 支持版本
  }[];

  /**
   * 支持的Markdown扩展特性
   */
  markdownFeatures: string[];
}
