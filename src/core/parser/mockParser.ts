// src/core/parser/mockParser.ts
import type {
  ParserOptions,
  ParseResult,
  ContentChange,
  TocResult,
  SupportedFeatures,
  CodeBlock,
  Token
} from "@/types/editor";

import MarkdownParser from 'myz-markdown-parser';

// 定义 Markdown 解析器接口
export interface IMarkdownParser {
  parse(content: string, options?: ParserOptions): ParseResult;
  parseIncremental(
    content: string,
    changes: ContentChange[],
    options?: ParserOptions
  ): ParseResult;
  getTableOfContents(content: string): TocResult;
  getSupportedFeatures(): SupportedFeatures;
}

// 用于生成唯一ID的辅助函数
const generateUniqueId = (): string => {
  return 'code-' + Math.random().toString(36).substr(2, 9);
};

// 简单的代码高亮处理函数
const tokenizeCode = (code: string, language: string): Token[] => {
  const tokens: Token[] = [];
  let position = 0;

  // 简单的关键字列表
  const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'return', 'class', 'import', 'export'];

  // 按行处理代码
  const lines = code.split('\n');

  lines.forEach((line, lineIndex) => {
    // 处理空行
    if (!line.trim()) {
      tokens.push({
        type: 'text',
        text: '\n',
        position: {
          start: position,
          end: position + 1
        }
      });
      position += 1;
      return;
    }

    // 使用正则表达式匹配不同类型的token
    let currentPosition = 0;
    while (currentPosition < line.length) {
      let matched = false;
      const remainingLine = line.slice(currentPosition);

      // 匹配关键字、标识符
      const identifierMatch = remainingLine.match(/^[a-zA-Z_]\w*/);
      if (identifierMatch) {
        const word = identifierMatch[0];
        const type = keywords.includes(word) ? 'keyword' : 'text';
        tokens.push({
          type,
          text: word,
          position: {
            start: position + currentPosition,
            end: position + currentPosition + word.length
          }
        });
        currentPosition += word.length;
        matched = true;
      }

      // 匹配字符串
      const stringMatch = remainingLine.match(/^"[^"]*"|^'[^']*'/);
      if (stringMatch) {
        tokens.push({
          type: 'string',
          text: stringMatch[0],
          position: {
            start: position + currentPosition,
            end: position + currentPosition + stringMatch[0].length
          }
        });
        currentPosition += stringMatch[0].length;
        matched = true;
      }

      // 匹配注释
      const commentMatch = remainingLine.match(/^\/\/.*/);
      if (commentMatch) {
        tokens.push({
          type: 'comment',
          text: commentMatch[0],
          position: {
            start: position + currentPosition,
            end: position + currentPosition + commentMatch[0].length
          }
        });
        currentPosition += commentMatch[0].length;
        matched = true;
      }

      // 匹配操作符和分隔符
      const operatorMatch = remainingLine.match(/^(\+\+|--|&&|\|\||[+\-*/%=<>!&|^~?:;.,{}()\[\]])/);
      if (operatorMatch) {
        tokens.push({
          type: 'operator',
          text: operatorMatch[0],
          position: {
            start: position + currentPosition,
            end: position + currentPosition + operatorMatch[0].length
          }
        });
        currentPosition += operatorMatch[0].length;
        matched = true;
      }

      // 匹配空白字符
      const whitespaceMatch = remainingLine.match(/^\s+/);
      if (whitespaceMatch) {
        tokens.push({
          type: 'text',
          text: whitespaceMatch[0],
          position: {
            start: position + currentPosition,
            end: position + currentPosition + whitespaceMatch[0].length
          }
        });
        currentPosition += whitespaceMatch[0].length;
        matched = true;
      }

      // 如果没有匹配任何规则，前进一个字符
      if (!matched) {
        tokens.push({
          type: 'text',
          text: remainingLine[0],
          position: {
            start: position + currentPosition,
            end: position + currentPosition + 1
          }
        });
        currentPosition += 1;
      }
    }

    position += line.length;

    // 在每行末尾添加换行符（除了最后一行）
    if (lineIndex < lines.length - 1) {
      tokens.push({
        type: 'text',
        text: '\n',
        position: {
          start: position,
          end: position + 1
        }
      });
      position += 1;
    }
  });

  return tokens;
};

// 解析代码块的函数
const parseCodeBlock = (content: string): CodeBlock[] => {
  const codeBlocks: CodeBlock[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    let language = match[1].toLowerCase() || 'plaintext';
    const code = match[2].trim();

    // 根据语言选择不同的token生成函数
    let tokens;
    if (language === 'javascript' || language === 'js') {
      language = 'javascript';
      tokens = mockJavaScriptTokens(code);
    } else if (language === 'python' || language === 'py') {
      language = 'python';
      tokens = mockPythonTokens(code);
    } else {
      language = 'plaintext';
      tokens = plainTextTokens(code);
    }

    codeBlocks.push({
      id: generateUniqueId(),
      language,
      position: {
        start: match.index,
        end: match.index + match[0].length
      },
      tokens
    });
  }

  return codeBlocks;
};

export class MockMarkdownParser implements IMarkdownParser {
  private options: ParserOptions;
  private parser: any;

  constructor(options: ParserOptions) {
    this.options = options;
    this.parser = new MarkdownParser();
  }

  parse(content: string): ParseResult {
    // 检测并解析代码块
    const codeBlocks = parseCodeBlock(content);
    let html = content;

    // 处理代码块
    codeBlocks.forEach(block => {
      const originalCode = content.substring(block.position.start, block.position.end);
      html = html.replace(originalCode, codeBlockToHtml(block));
    });
    console.log("0_1_codeBlocks")
    console.log(codeBlocks)

    // // 处理其他Markdown语法
    // html = html
    //   .split('\n')
    //   .map(line => {
    //     if (line.startsWith('# ')) {
    //       return `<h1>${line.slice(2)}</h1>`;
    //     }
    //     if (line.startsWith('## ')) {
    //       return `<h2>${line.slice(3)}</h2>`;
    //     }
    //     if (!line.startsWith('```') && line.trim() !== '') {  // 避免处理代码块标记
    //       return `<p>${line}</p>`;
    //     }
    //     return line;
    //   })
    //   .join('\n');
    //
    // console.log("0_2_html")
    // console.log(html);

    let htmlFromParser = this.parser.render(html);
    console.log("0_3_htmlFromParser")
    console.log(htmlFromParser);

    // 返回解析结果
    return {
      "html": htmlFromParser,
      codeBlocks,
      meta: {
        wordCount: content.split(/\s+/).length,
        statistics: {
          codeBlocks: codeBlocks.length,
          images: 0,
          links: 0,
          tables: 0
        }
      },
      warnings: []
    };
  }

  parseIncremental(
    content: string,
    changes: ContentChange[]
  ): ParseResult {
    // 目前仍然使用完整解析
    return this.parse(content);
  }

  getTableOfContents(content: string): TocResult {
    const headings = content
      .split('\n')
      .filter(line => line.startsWith('#'))
      .map((line, index) => ({
        text: line.replace(/^#+\s/, ''),
        level: (line.match(/^#+/) || [''])[0].length,
        id: `heading-${index}`,
        position: index,
        children: []
      }));

    return {
      items: headings,
      meta: {
        maxDepth: Math.max(...headings.map(h => h.level)),
        totalHeadings: headings.length
      }
    };
  }

  getSupportedFeatures(): SupportedFeatures {
    return {
      languages: [
        {
          id: 'javascript',
          name: 'JavaScript',
          aliases: ['js'],
          version: '1.0.0'
        },
        {
          id: 'typescript',
          name: 'TypeScript',
          aliases: ['ts'],
          version: '1.0.0'
        },
        {
          id: 'python',
          name: 'Python',
          aliases: ['py'],
          version: '1.0.0'
        },
        {
          id: 'plaintext',
          name: 'Plain Text',
          aliases: ['text'],
          version: '1.0.0'
        }
      ],
      markdownFeatures: [
        'headers',
        'bold',
        'italic',
        'lists',
        'code',
        'codeBlock'
      ]
    };
  }
}

let parserInstance: IMarkdownParser | null = null;
let parserOptions: ParserOptions | null = null;

export const getParserInstance = (options?: ParserOptions): IMarkdownParser => {
  if (!parserInstance || options !== parserOptions) {
    parserOptions = options || parserOptions;
    parserInstance = new MockMarkdownParser(parserOptions!);
  }
  return parserInstance;
};

const mockJavaScriptTokens = (code: string): Token[] => {
  const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'return', 'class', 'new', 'this', 'async', 'await'];
  const lines = code.split('\n');
  let position = 0;
  const tokens: Token[] = [];

  lines.forEach(line => {
    // 处理注释
    if (line.trim().startsWith('//')) {
      tokens.push({
        type: 'comment',
        text: line,
        position: {
          start: position,
          end: position + line.length
        }
      });
      tokens.push({
        type: 'text',
        text: '\n',
        position: {
          start: position + line.length,
          end: position + line.length + 1
        }
      });
      position += line.length + 1;
      return;
    }

    // 使用简单的空格分割
    const words = line.split(/(\s+|[.,(){}[\]=+\-*/<>!&|;:'"`])/);
    words.forEach(word => {
      if (!word) return;

      let type = 'text';
      if (keywords.includes(word)) {
        type = 'keyword';
      } else if (word.match(/^["'`].*["'`]$/)) {
        type = 'string';
      } else if (word.match(/^\d+$/)) {
        type = 'number';
      } else if (word.match(/[.,(){}[\]=+\-*/<>!&|;]/)) {
        type = 'operator';
      }

      tokens.push({
        type,
        text: word,
        position: {
          start: position,
          end: position + word.length
        }
      });
      position += word.length;
    });

    // 添加换行符
    tokens.push({
      type: 'text',
      text: '\n',
      position: {
        start: position,
        end: position + 1
      }
    });
    position += 1;
  });

  return tokens;
};

const mockPythonTokens = (code: string): Token[] => {
  const keywords = ['def', 'class', 'return', 'print', 'import', 'from', 'async', 'await', 'with', 'as', 'lambda'];
  const lines = code.split('\n');
  let position = 0;
  const tokens: Token[] = [];

  lines.forEach(line => {
    // 处理注释
    if (line.trim().startsWith('#')) {
      tokens.push({
        type: 'comment',
        text: line,
        position: {
          start: position,
          end: position + line.length
        }
      });
      tokens.push({
        type: 'text',
        text: '\n',
        position: {
          start: position + line.length,
          end: position + line.length + 1
        }
      });
      position += line.length + 1;
      return;
    }

    const words = line.split(/(\s+|[.,(){}[\]=+\-*/<>!&|;:'"])/);
    words.forEach(word => {
      if (!word) return;

      let type = 'text';
      if (keywords.includes(word)) {
        type = 'keyword';
      } else if (word.match(/^["'].*["']$/)) {
        type = 'string';
      } else if (word.match(/^\d+$/)) {
        type = 'number';
      } else if (word.match(/[.,(){}[\]=+\-*/<>!&|;]/)) {
        type = 'operator';
      }

      tokens.push({
        type,
        text: word,
        position: {
          start: position,
          end: position + word.length
        }
      });
      position += word.length;
    });

    tokens.push({
      type: 'text',
      text: '\n',
      position: {
        start: position,
        end: position + 1
      }
    });
    position += 1;
  });

  return tokens;
};

const plainTextTokens = (code: string): Token[] => {
  const lines = code.split('\n');
  let position = 0;
  const tokens: Token[] = [];

  lines.forEach(line => {
    tokens.push({
      type: 'text',
      text: line,
      position: {
        start: position,
        end: position + line.length
      }
    });
    tokens.push({
      type: 'text',
      text: '\n',
      position: {
        start: position + line.length,
        end: position + line.length + 1
      }
    });
    position += line.length + 1;
  });

  return tokens;
};

// 添加到 mockParser.ts 文件中，将代码块转换为 HTML 的函数
const codeBlockToHtml = (block: CodeBlock): string => {
  let html = `<pre data-code-theme="github"><code class="language-${block.language}" data-code-block-id="${block.id}">`;

  let currentLineHtml = '';

  block.tokens.forEach(token => {
    if (token.text === '\n') {
      html += currentLineHtml + '\n';
      currentLineHtml = '';
      return;
    }

    // 只对非空白字符添加 token 包装
    if (token.text.trim()) {
      currentLineHtml += `<span class="token ${token.type}">${escapeHtml(token.text)}</span>`;
    } else {
      currentLineHtml += token.text;
    }
  });

  // 添加最后一行
  if (currentLineHtml) {
    html += currentLineHtml;
  }

  html += '</code></pre>';
  return html;
};

// 添加 HTML 转义函数，用于安全地显示代码
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
