// parser\src\core\tokenizer.ts
import { Token } from '../types';

export class Tokenizer {
  private text: string = '';
  private pos: number = 0; // 始终指向当前正在等待处理的字符的位置
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

  /**
   * 扫描并处理当前位置的字符，生成相应的Token并添加到tokens数组中
   * 这是Tokenizer的核心方法，负责将Markdown文本转换为Token流的主要逻辑
   * 方法会根据当前字符的类型（特殊符号或普通文本）调用不同的处理函数
   */
  private scanTokens(): void {
    // 获取当前位置的字符
    const char = this.text[this.pos];

    // 处理特殊符号（如 #, *, ~）
    if (this.isSymbol(char)) {
      // 记录特殊符号的起始位置
      const start = this.pos;

      // 调用scanSymbol方法解析符号，可能会处理连续的相同符号（如 ** 表示粗体）
      // scanSymbol方法会更新this.pos，指向符号之后的位置
      const symbol = this.scanSymbol();

      // 创建symbol类型的Token并添加到tokens数组
      this.tokens.push({
        type: 'symbol',    // 标记为符号类型
        value: symbol,     // 符号的实际内容（如 #, **, ~ 等）
        position: {        // 符号在原始文本中的位置信息
          start,           // 符号的起始位置
          end: this.pos    // 符号的结束位置（已更新）
        }
      });
      return;  // 处理完符号后返回，继续下一个字符的处理
    }

    // 处理普通文本（非特殊符号的字符）
    const start = this.pos;  // 记录文本的起始位置

    // 调用scanText方法收集连续的普通文本
    // scanText会持续读取字符直到遇到特殊符号或文本结束
    // 并更新this.pos指向文本之后的位置
    const text = this.scanText();

    // 确保文本非空，避免创建空Token
    if (text) {
      // 创建text类型的Token并添加到tokens数组
      this.tokens.push({
        type: 'text',      // 标记为文本类型
        value: text,       // 文本的实际内容
        position: {        // 文本在原始文本中的位置信息
          start,           // 文本的起始位置
          end: this.pos    // 文本的结束位置（已更新）
        }
      });
    }
    // 方法结束后，this.pos已指向下一个待处理字符的位置
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
