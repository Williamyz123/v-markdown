// parser\src\core\parser.ts
import { Token, ASTNode, NodeType } from '../types';

export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;


  private splitTokensIntoLines(): Token[][] {
    const lines: Token[][] = [];
    let currentLine: Token[] = [];

    for (const token of this.tokens) {
      if (token.type === 'text' && token.value.includes('\n')) {
        const parts = token.value.split('\n');
        // 处理当前行
        if (parts[0]) {
          currentLine.push({
            ...token,
            value: parts[0]
          });
        }
        lines.push(currentLine);

        // 处理中间行
        for (let i = 1; i < parts.length - 1; i++) {
          if (parts[i]) {
            lines.push([{
              type: 'text',
              value: parts[i],
              position: token.position
            }]);
          }
        }

        // 开始新行
        currentLine = [];
        if (parts[parts.length - 1]) {
          currentLine.push({
            ...token,
            value: parts[parts.length - 1]
          });
        }
      } else {
        currentLine.push(token);
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  private parseLine(tokens: Token[]): ASTNode | null {
    if (tokens.length === 0) return null;

    const firstToken = tokens[0];
    const text = firstToken.value;

    // 处理水平线
    if (text === '---' || text === '***') {
      return {
        type: 'hr',
        tag: 'hr'
      };
    }

    // 处理引用
    if (text.startsWith('> ')) {
      return this.parseBlockquote(tokens);
    }

    // 解析无序列表
    if (firstToken.type === 'text' &&
      (firstToken.value.startsWith('- ') || firstToken.value.startsWith('* '))) {
      return this.parseListItem(tokens, 'bullet');
    }

    // 解析有序列表
    if (firstToken.type === 'text' && /^\d+\.\s/.test(firstToken.value)) {
      return this.parseListItem(tokens, 'ordered');
    }

    // ... 其他解析逻辑保持不变
    if (firstToken.type === 'symbol' && firstToken.value.startsWith('#')) {
      return this.parseHeading(tokens);
    }

    return this.parseParagraph(tokens);
  }

  private parseBlockquote(tokens: Token[]): ASTNode {
    const firstToken = tokens[0];
    let content = firstToken.value.slice(2); // 移除 '> '

    // 更新token内容
    const newTokens = [
      {
        ...firstToken,
        value: content
      },
      ...tokens.slice(1)
    ];

    return {
      type: 'blockquote',
      tag: 'blockquote',
      children: this.parseInlineTokens(newTokens)
    };
  }

  private parseListItem(tokens: Token[], listType: 'bullet' | 'ordered'): ASTNode {
    const firstToken = tokens[0];
    let content = firstToken.value;

    // 移除列表标记
    if (listType === 'bullet') {
      content = content.replace(/^[-*]\s+/, '');
    } else {
      content = content.replace(/^\d+\.\s+/, '');
    }

    // 修改这里：用修改后的content创建新的token
    const newTokens = [
      {
        ...firstToken,
        value: content
      },
      ...tokens.slice(1)
    ];

    return {
      type: 'list_item',
      tag: 'li',
      listType,
      children: this.parseInlineTokens(newTokens)  // 使用包含内容的newTokens
    };
  }

  // 新增：合并连续的列表项
  private processNodes(nodes: ASTNode[]): ASTNode[] {
    const processed: ASTNode[] = [];
    let currentList: ASTNode | null = null;
    let currentListType: 'bullet' | 'ordered' | null = null;
    let currentQuote: ASTNode | null = null;

    for (const node of nodes) {
      if (node.type === 'list_item') {
        // 列表处理逻辑保持不变...
      } else if (node.type === 'blockquote') {
        // 处理连续的引用
        if (!currentQuote) {
          currentQuote = {
            type: 'blockquote',
            tag: 'blockquote',
            children: []
          };
          processed.push(currentQuote);
        }
        currentQuote.children = currentQuote.children || [];
        if (node.children) {
          currentQuote.children.push(...node.children);
        }
      } else {
        // 重置当前引用和列表
        currentList = null;
        currentListType = null;
        currentQuote = null;
        processed.push(node);
      }
    }

    return processed;
  }

  parse(tokens: Token[]): ASTNode {
    this.tokens = tokens;
    this.current = 0;

    const lines = this.splitTokensIntoLines();
    const rawNodes = lines
      .map(line => this.parseLine(line))
      .filter((node): node is ASTNode => node !== null);

    const processedNodes = this.processNodes(rawNodes);

    return {
      type: 'root',
      children: processedNodes
    };
  }

  private parseHeading(tokens: Token[]): ASTNode {
    let level = 1;
    let current = 0;

    // 计算标题级别
    while (
      current < tokens.length &&
      tokens[current].type === 'symbol' &&
      tokens[current].value === '#'
      ) {
      level++;
      current++;
    }

    // 创建标题节点
    const heading: ASTNode = {
      type: 'heading',
      tag: `h${Math.min(level, 3)}`,
      level: Math.min(level, 3),
      children: []
    };

    // 解析标题内容
    heading.children = this.parseInlineTokens(tokens.slice(current));

    return heading;
  }

  private parseParagraph(tokens: Token[]): ASTNode {
    return {
      type: 'paragraph',
      tag: 'p',
      children: this.parseInlineTokens(tokens)
    };
  }

  private parseInlineTokens(tokens: Token[]): ASTNode[] {
    const nodes: ASTNode[] = [];
    let current = 0;

    while (current < tokens.length) {
      const token = tokens[current];
      const text = token.value;

      // 处理图片 - 优先处理图片，因为图片语法包含链接语法
      const imgMatch = text.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const [fullMatch, alt, url] = imgMatch;
        const index = text.indexOf(fullMatch);

        // 处理图片前的文本
        if (index > 0) {
          nodes.push({
            type: 'text',
            value: text.slice(0, index)
          });
        }

        // 添加图片节点
        nodes.push({
          type: 'image',
          tag: 'img',
          alt,
          url
        });

        // 更新当前token的剩余内容
        tokens[current] = {
          ...token,
          value: text.slice(index + fullMatch.length)
        };
        continue;
      }

      // 处理链接
      const linkMatch = text.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [fullMatch, text, url] = linkMatch;
        const index = token.value.indexOf(fullMatch);

        // 处理链接前的文本
        if (index > 0) {
          nodes.push({
            type: 'text',
            value: token.value.slice(0, index)
          });
        }

        // 添加链接节点
        nodes.push({
          type: 'link',
          tag: 'a',
          url,
          children: [{
            type: 'text',
            value: text
          }]
        });

        // 更新当前token的剩余内容
        tokens[current] = {
          ...token,
          value: token.value.slice(index + fullMatch.length)
        };
        continue;
      }



      if (token.type === 'symbol') {
        if (token.value === '**') {
          // 解析粗体
          const bold = this.parseBold(tokens, current);
          if (bold) {
            nodes.push(bold.node);
            current = bold.nextIndex;
            continue;
          }
        } else if (token.value === '*') {
          // 解析斜体
          const italic = this.parseItalic(tokens, current);
          if (italic) {
            nodes.push(italic.node);
            current = italic.nextIndex;
            continue;
          }
        } else if (token.value === '~~') {
          // 解析删除线
          const strike = this.parseStrikethrough(tokens, current);
          if (strike) {
            nodes.push(strike.node);
            current = strike.nextIndex;
            continue;
          }
        }
      }

      // 处理普通文本
      if (token.value) {
        nodes.push({
          type: 'text',
          value: token.value
        });
      }
      current++;
    }

    return nodes;
  }

  private parseBold(tokens: Token[], start: number): { node: ASTNode; nextIndex: number } | null {
    return this.parseDelimited(tokens, start, '**', 'bold', 'strong');
  }

  private parseItalic(tokens: Token[], start: number): { node: ASTNode; nextIndex: number } | null {
    return this.parseDelimited(tokens, start, '*', 'italic', 'em');
  }

  private parseStrikethrough(tokens: Token[], start: number): { node: ASTNode; nextIndex: number } | null {
    return this.parseDelimited(tokens, start, '~~', 'strikethrough', 'del');
  }

  private parseDelimited(
    tokens: Token[],
    start: number,
    delimiter: string,
    type: NodeType,
    tag: string
  ): { node: ASTNode; nextIndex: number } | null {
    // 查找结束定界符
    let end = start + 1;
    while (end < tokens.length) {
      if (tokens[end].type === 'symbol' && tokens[end].value === delimiter) {
        // 创建节点
        const node: ASTNode = {
          type,
          tag,
          children: this.parseInlineTokens(tokens.slice(start + 1, end))
        };
        return { node, nextIndex: end + 1 };
      }
      end++;
    }
    return null;
  }
}
