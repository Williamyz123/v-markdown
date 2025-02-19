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

      case 'heading':
      case 'paragraph':
      case 'bold':
      case 'italic':
      case 'strikethrough':
        return this.renderElement(node);

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
