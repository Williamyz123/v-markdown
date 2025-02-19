// parser\src\core\renderer.ts
import { ASTNode } from '../types';

export class Renderer {
  render(ast: ASTNode): string {
    return this.renderNode(ast);
  }

  private renderNode(node: ASTNode): string {
    switch (node.type) {
      case 'root':
        return this.renderChildren(node);

      case 'link':
        return `<a href="${node.url}">${this.renderChildren(node)}</a>`;

      case 'image':
        return `<img src="${node.url}" alt="${node.alt || ''}">`;

      case 'heading':
      case 'paragraph':
      case 'bold':
      case 'italic':
      case 'strikethrough':
      case 'bullet_list':
      case 'ordered_list':
      case 'list_item':
      case 'blockquote':
      case 'table':
      case 'table_row':
        return this.renderElement(node);
      case 'hr':
        return '<hr>';
      case 'table_cell':
        const tag = node.isHeader ? 'th' : 'td';
        return `<${tag}>${this.renderChildren(node)}</${tag}>`;

      case 'text':
        return node.value || '';
      default:
        return '';
    }
  }

  private renderElement(node: ASTNode): string {
    const tag = node.tag;
    const children = this.renderChildren(node);
    return `<${tag}>${children}</${tag}>`;
  }

  private renderChildren(node: ASTNode): string {
    if (!node.children) return '';
    return node.children.map(child => this.renderNode(child)).join('');
  }
}
