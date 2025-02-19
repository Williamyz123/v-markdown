// parser\src\core\tokenizer.ts
import { Token } from '../types';

export class Tokenizer {
  private text: string = '';
  private pos: number = 0;
  private tokens: Token[] = [];

  tokenize(input: string): Token[] {
    this.text = input;
    this.pos = 0;
    this.tokens = [];

    while (this.pos < this.text.length) {
      this.scanTokens();
    }

    return this.tokens;
  }

  private scanTokens(): void {
    const char = this.text[this.pos];

    // 处理特殊符号
    if (this.isSymbol(char)) {
      const start = this.pos;
      const symbol = this.scanSymbol();
      this.tokens.push({
        type: 'symbol',
        value: symbol,
        position: { start, end: this.pos }
      });
      return;
    }

    // 处理普通文本
    const start = this.pos;
    const text = this.scanText();
    if (text) {
      this.tokens.push({
        type: 'text',
        value: text,
        position: { start, end: this.pos }
      });
    }
  }

  private isSymbol(char: string): boolean {
    return ['#', '*', '~'].includes(char);
  }

  private scanSymbol(): string {
    const char = this.text[this.pos];
    let symbol = char;

    // 检查连续符号
    if (this.pos + 1 < this.text.length) {
      if (
        (char === '*' && this.text[this.pos + 1] === '*') ||
        (char === '~' && this.text[this.pos + 1] === '~')
      ) {
        symbol = char + char;
        this.pos++;
      }
    }

    this.pos++;
    return symbol;
  }

  private scanText(): string {
    let text = '';
    while (
      this.pos < this.text.length &&
      !this.isSymbol(this.text[this.pos])
      ) {
      text += this.text[this.pos];
      this.pos++;
    }
    return text;
  }
}
