// AST 节点类型
export type NodeType =
  | 'root'           // 根节点
  | 'heading'        // 标题
  | 'paragraph'      // 段落
  | 'text'           // 文本
  | 'bold'          // 粗体
  | 'italic'        // 斜体
  | 'strikethrough' // 删除线
  | 'bullet_list'   // 无序列表
  | 'ordered_list'  // 有序列表
  | 'list_item'     // 列表项
  | 'link'          // 链接
  | 'image'         // 图片
  | 'blockquote'    // 引用
  | 'hr'            // 水平线
  | 'table'         // 表格
  | 'table_row'     // 表格行
  | 'table_cell';   // 表格单元格

// AST 节点接口
export interface ASTNode {
  type: NodeType;
  tag?: string;      // HTML标签名
  value?: string;    // 文本内容
  level?: number;    // 标题级别
  children?: ASTNode[];
  listType?: 'bullet' | 'ordered';
  url?: string;      // url属性
  alt?: string;      // alt属性
  isHeader?: boolean; // 标记是否为表头单元格
}

export interface Token {
  type: 'text' | 'symbol';
  value: string;
  position: {
    start: number;
    end: number;
  };
}
