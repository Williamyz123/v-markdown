// parser\src\core\parser.ts
import { Token, ASTNode, NodeType } from '../types';

export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;

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

  /**
   * 将线性的Token流分割成以行为单位的二维数组
   * 这个方法是Parser中的关键预处理步骤，为后续的块级元素识别做准备
   *
   * Markdown的块级元素（如标题、段落、列表等）通常以行为基本单位
   * 将Token按行组织可以更自然地识别这些块级结构
   *
   * @returns Token[][] 二维数组，每个子数组代表一行Token
   */
  private splitTokensIntoLines(): Token[][] {
    // 用于存储分割后的行，每行是一个Token数组
    const lines: Token[][] = [];
    // 当前正在处理的行
    let currentLine: Token[] = [];

    // 遍历所有Token
    for (const token of this.tokens) {
      // 处理包含换行符的文本Token
      // 这种Token需要被分割成多行
      if (token.type === 'text' && token.value.includes('\n')) {
        // 按换行符分割文本内容
        const parts = token.value.split('\n');

        // 处理第一部分（当前行的剩余部分）
        if (parts[0]) {
          // 将第一部分添加到当前行
          currentLine.push({
            ...token,
            value: parts[0]
          });
        }
        // 将当前行添加到行数组中
        lines.push(currentLine);

        // 处理中间的各行（如果有多个换行符）
        // 这些行是完整的独立行
        for (let i = 1; i < parts.length - 1; i++) {
          if (parts[i]) {
            // 为每个非空的中间部分创建一个新行
            lines.push([{
              type: 'text',
              value: parts[i],
              position: token.position // 保留原始位置信息用于错误追踪
            }]);
          }
        }

        // 开始新的一行以处理最后一部分
        currentLine = [];
        // 如果最后一部分非空，将其添加到新行
        if (parts[parts.length - 1]) {
          currentLine.push({
            ...token,
            value: parts[parts.length - 1]
          });
        }
      } else {
        // 处理不包含换行符的Token
        // 直接添加到当前行
        currentLine.push(token);
      }
    }

    // 确保最后一行也被添加到结果中
    // 处理文档不以换行符结束的情况
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // 返回按行组织的Token二维数组
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
      (text.startsWith('- ') || text.startsWith('* '))) {
      return this.parseListItem(tokens, 'bullet');
    }

    // 解析有序列表
    if (firstToken.type === 'text' && /^\d+\.\s/.test(text)) {
      return this.parseListItem(tokens, 'ordered');
    }

    // 处理标题
    if (firstToken.type === 'symbol' && firstToken.value.startsWith('#')) {
      return this.parseHeading(tokens);
    }

    return this.parseParagraph(tokens);
  }

  /**
   * 解析内联元素并构建对应的AST节点
   * 该方法处理段落内的格式化元素，如粗体、斜体、链接、图片等
   * 采用优先级处理策略，按特定顺序处理不同类型的内联元素
   *
   * @param tokens 要解析的Token数组，通常是一个段落或其他块级元素内的内容
   * @returns ASTNode[] 解析后的AST节点数组，表示内联元素的层次结构
   */
  private parseInlineTokens(tokens: Token[]): ASTNode[] {
    // 用于存储解析结果的节点数组
    const nodes: ASTNode[] = [];
    // 当前处理的Token索引
    let current = 0;

    // 遍历所有Token
    while (current < tokens.length) {
      const token = tokens[current];
      const text = token.value;

      // 处理图片 - 优先处理图片，因为图片语法包含链接语法
      // 图片格式: ![alt](url)
      const imgMatch = text.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        // 提取匹配的完整文本、替代文本和URL
        // fullMatch：代表完整匹配的字符串，也就是整个图片语法（例如 ![alt](url)）。
        // alt：代表图片的替代文本，对应正则表达式里的第一个捕获组 (.*?)。
        // url：代表图片的 URL，对应正则表达式里的第二个捕获组 (.*?)。
        const [fullMatch, alt, url] = imgMatch;
        // 查找匹配文本在原始文本中的位置
        const index = text.indexOf(fullMatch);

        // 处理图片前的文本（如果有）
        if (index > 0) {
          nodes.push({
            type: 'text',
            value: text.slice(0, index)
          });
        }

        // 添加图片节点到结果数组
        nodes.push({
          type: 'image',
          tag: 'img',
          alt,  // 设置alt属性
          url   // 设置src属性
        });

        // 更新当前token的值，移除已处理的部分
        // 这允许在同一个token中处理多个内联元素
        tokens[current] = {
          ...token,
          value: text.slice(index + fullMatch.length)
        };
        // 不增加current，继续处理当前token的剩余内容
        continue;
      }

      // 处理链接
      // 链接格式: [text](url)
      const linkMatch = text.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [fullMatch, linkText, url] = linkMatch;
        const index = token.value.indexOf(fullMatch);

        // 处理链接前的文本（如果有）
        if (index > 0) {
          nodes.push({
            type: 'text',
            value: token.value.slice(0, index)
          });
        }

        // 添加链接节点到结果数组
        nodes.push({
          type: 'link',
          tag: 'a',
          url,  // 设置href属性
          children: [{
            type: 'text',
            value: linkText  // 链接文本作为子节点
          }]
        });

        // 更新当前token的值，移除已处理的部分
        tokens[current] = {
          ...token,
          value: token.value.slice(index + fullMatch.length)
        };
        // 不增加current，继续处理当前token的剩余内容
        continue;
      }

      // 处理格式化标记（粗体、斜体、删除线）
      if (token.type === 'symbol') {
        if (token.value === '**') {
          // 解析粗体 - 由**包围的文本
          const bold = this.parseBold(tokens, current);
          if (bold) {
            // 如果成功解析到粗体，添加到节点数组
            nodes.push(bold.node);
            // 更新current到粗体结束后的位置
            current = bold.nextIndex;
            continue;
          }
        } else if (token.value === '*') {
          // 解析斜体 - 由*包围的文本
          const italic = this.parseItalic(tokens, current);
          if (italic) {
            nodes.push(italic.node);
            current = italic.nextIndex;
            continue;
          }
        } else if (token.value === '~~') {
          // 解析删除线 - 由~~包围的文本
          const strike = this.parseStrikethrough(tokens, current);
          if (strike) {
            nodes.push(strike.node);
            current = strike.nextIndex;
            continue;
          }
        }
      }

      // 处理普通文本
      // 如果以上特殊格式都不匹配，则作为普通文本处理
      if (token.value) {
        nodes.push({
          type: 'text',
          value: token.value
        });
      }
      // 移动到下一个token
      current++;
    }

    // 返回所有解析出的节点
    return nodes;
  }


  /**
   *
   * @param tokens 一行的token
   * @private
   */
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

  private isTableRow(text: string): boolean {
    return text.trim().startsWith('|') && text.trim().endsWith('|');
  }

  private isTableDelimiter(text: string): boolean {
    return /^\|(\s*-+\s*\|)+$/.test(text.trim());
  }

  private parseTableRow(text: string, isHeader: boolean = false): ASTNode {
    // 移除首尾的 | 并分割单元格
    const cells = text.trim()
      .slice(1, -1)
      .split('|')
      .map(cell => cell.trim());

    return {
      type: 'table_row',
      tag: 'tr',
      children: cells.map(cellContent => ({
        type: 'table_cell',
        tag: isHeader ? 'th' : 'td',
        isHeader,
        children: this.parseInlineTokens([{ type: 'text', value: cellContent, position: { start: 0, end: 0 } }])
      }))
    };
  }

  private parseHeading(tokens: Token[]): ASTNode {
    let level = 0;
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

  private parseBold(tokens: Token[], start: number): { node: ASTNode; nextIndex: number } | null {
    return this.parseDelimited(tokens, start, '**', 'bold', 'strong');
  }

  private parseItalic(tokens: Token[], start: number): { node: ASTNode; nextIndex: number } | null {
    return this.parseDelimited(tokens, start, '*', 'italic', 'em');
  }

  private parseStrikethrough(tokens: Token[], start: number): { node: ASTNode; nextIndex: number } | null {
    return this.parseDelimited(tokens, start, '~~', 'strikethrough', 'del');
  }

  /**
   * 解析由特定定界符包围的内联元素（如粗体、斜体、删除线等）
   * 这是一个通用方法，用于处理各种具有相似语法模式的格式化元素
   *
   * @param tokens 要处理的Token数组
   * @param start 开始定界符在tokens数组中的索引位置
   * @param delimiter 定界符字符串（如 "**", "*", "~~"）
   * @param type 要创建的节点类型（如 "bold", "italic", "strikethrough"）
   * @param tag 对应的HTML标签名（如 "strong", "em", "del"）
   * @returns 如果成功解析，返回包含创建的节点和下一个处理位置的对象；否则返回null
   */
  private parseDelimited(
    tokens: Token[],
    start: number,
    delimiter: string,
    type: NodeType,
    tag: string
  ): { node: ASTNode; nextIndex: number } | null {
    // 查找结束定界符
    // 从开始定界符之后的位置开始搜索
    let end = start + 1;
    while (end < tokens.length) {
      // 检查当前token是否是符号类型且值等于定界符
      if (tokens[end].type === 'symbol' && tokens[end].value === delimiter) {
        // 找到匹配的结束定界符，创建相应的格式化节点
        const node: ASTNode = {
          type,  // 节点类型（如bold、italic等）
          tag,   // HTML标签（如strong、em等）
          // 递归解析开始和结束定界符之间的内容
          // 这允许处理嵌套的格式化元素
          children: this.parseInlineTokens(tokens.slice(start + 1, end))
        };

        // 返回创建的节点和下一个处理位置（结束定界符之后）
        return { node, nextIndex: end + 1 };
      }
      // 继续搜索下一个token
      end++;
    }

    // 如果遍历完所有token都没找到匹配的结束定界符
    // 返回null表示解析失败
    // 调用方通常会将开始定界符作为普通文本处理
    return null;
  }

  /**
   * 处理并组织已解析的节点，识别和构建复杂的块级结构
   * 这个方法在初步解析之后调用，负责将相关的块级节点组合成更复杂的结构（如表格、列表）
   *
   * @param nodes 初步解析后的AST节点数组
   * @returns 处理后的AST节点数组，包含完整的结构化块级元素
   */
  private processNodes(nodes: ASTNode[]): ASTNode[] {
    // 创建处理结果数组，将存储最终的块级节点
    const processed: ASTNode[] = [];

    // 状态变量，用于跟踪当前正在处理的复杂结构
    let currentTable: ASTNode | null = null;  // 当前表格节点
    let currentList: ASTNode | null = null;   // 当前列表节点
    let isProcessingTable = false;  // 是否正在处理表格
    let hasDelimiter = false;      // 是否已找到表格分隔行

    // 遍历所有初步解析的节点
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // 处理列表项
      if (node.type === 'list_item') {
        // 如果是新的列表或列表类型改变
        // 需要创建新的列表容器节点
        if (!currentList ||
          (currentList.type === 'bullet_list' && node.listType === 'ordered') ||
          (currentList.type === 'ordered_list' && node.listType === 'bullet')) {

          // 根据列表项类型创建适当的列表容器（有序或无序）
          currentList = {
            type: node.listType === 'bullet' ? 'bullet_list' : 'ordered_list',
            tag: node.listType === 'bullet' ? 'ul' : 'ol',
            children: []
          };
          // 将新列表添加到处理结果
          processed.push(currentList);
        }

        // 将列表项添加到当前列表的子节点
        currentList.children!.push(node);
        continue;  // 处理完列表项后跳到下一个节点
      } else {
        // 不是列表项，结束当前列表处理
        currentList = null;
      }

      // 处理表格
      // 获取节点的文本内容（如果存在）用于表格检测
      const nodeText = node.children?.[0]?.value || '';

      // 检查是否是表格行或表格行格式的文本
      if (node.type === 'table_row' || (nodeText && this.isTableRow(nodeText))) {
        // 如果不在处理表格状态，创建新表格
        if (!isProcessingTable) {
          // 创建表格容器节点
          currentTable = {
            type: 'table',
            tag: 'table',
            children: []
          };
          // 将表格添加到处理结果
          processed.push(currentTable);
          // 标记开始处理表格
          isProcessingTable = true;

          // 添加第一行（表头）
          if (node.type === 'table_row') {
            currentTable.children!.push(node);
          } else if (nodeText) {
            // 如果是文本节点，解析为表格行（作为表头）
            currentTable.children!.push(this.parseTableRow(nodeText, true));
          }
          continue;  // 处理完第一行后跳到下一个节点
        }

        // 检查是否为表格分隔行（由|和-组成的行，用于分隔表头和表体）
        if (nodeText && this.isTableDelimiter(nodeText)) {
          // 标记已找到分隔行，但不将分隔行添加到最终的表格结构
          hasDelimiter = true;
          continue;
        }

        // 如果已有分隔行且正在处理表格，添加表格体行
        if (hasDelimiter && currentTable) {
          if (node.type === 'table_row') {
            // 直接添加已解析的表格行节点
            currentTable.children!.push(node);
          } else if (nodeText) {
            // 解析文本为表格行（非表头）并添加
            currentTable.children!.push(this.parseTableRow(nodeText, false));
          }
          continue;
        }
      } else {
        // 不是表格相关节点，结束表格处理状态
        isProcessingTable = false;
        hasDelimiter = false;
      }

      // 处理其他类型的节点（非列表项、非表格）
      // 直接添加到处理结果
      processed.push(node);
    }

    // 返回处理后的节点数组
    return processed;
  }
}
