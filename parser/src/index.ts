// parser\src\index.ts
import { Tokenizer } from './core/tokenizer';
import { Parser } from './core/parser';
import { Renderer } from './core/renderer';
import type { ASTNode, Token } from './types';

export class MarkdownParser {
  private tokenizer: Tokenizer;
  private parser: Parser;
  private renderer: Renderer;

  constructor() {
    this.tokenizer = new Tokenizer();
    this.parser = new Parser();
    this.renderer = new Renderer();
  }

  // 获取Token流
  toTokens(markdown: string): Token[] {
    return this.tokenizer.tokenize(markdown);
  }

  // 获取AST
  toAST(markdown: string): ASTNode {
    const tokens = this.toTokens(markdown);
    return this.parser.parse(tokens);
  }

  // 渲染HTML
  render(markdown: string): string {
    const ast = this.toAST(markdown);
    return this.renderer.render(ast);
  }
}

export default MarkdownParser;
export { Token, ASTNode };
