// AST 节点类型
export type NodeType =
  | 'root'           // 根节点
  | 'heading'        // 标题
  | 'paragraph'      // 段落
  | 'text'           // 文本
  | 'bold'           // 粗体
  | 'italic'         // 斜体
  | 'strikethrough'  // 删除线
  | 'bullet_list'    // 无序列表
  | 'ordered_list'   // 有序列表
  | 'list_item'      // 列表项
  | 'link'        // 添加链接类型
  | 'image'       // 添加图片类型
  | 'blockquote'    // 添加引用类型
  | 'hr';           // 添加水平线类型

// AST 节点接口
export interface ASTNode {
  type: NodeType;
  tag?: string;      // HTML标签名
  value?: string;    // 文本内容
  level?: number;    // 标题级别
  children?: ASTNode[];
  listType?: 'bullet' | 'ordered';
  url?: string;       // 添加url属性
  alt?: string;       // 添加alt属性
}

// Token 接口
export interface Token {
  type: 'text' | 'symbol';
  value: string;
  position: {
    start: number;
    end: number;
  };
}
