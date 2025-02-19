// parser\src\core\parser.ts
import { Token, ASTNode, NodeType } from '../types';

export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;

  parse(tokens: Token[]): ASTNode {
    this.tokens = tokens;
    this.current = 0;

    // 创建根节点
    const ast: ASTNode = {
      type: 'root',
      children: []
    };

    // 解析每一行
    const lines = this.splitTokensIntoLines();
    for (const line of lines) {
      const node = this.parseLine(line);
      if (node) {
        ast.children!.push(node);
      }
    }

    return ast;
  }

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

    // 解析标题
    if (tokens[0].type === 'symbol' && tokens[0].value.startsWith('#')) {
      return this.parseHeading(tokens);
    }

    // 解析段落
    return this.parseParagraph(tokens);
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
      nodes.push({
        type: 'text',
        value: token.value
      });

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
