// src/core/editor/EditorContext.tsx
import React, {createContext, useContext, useReducer, useMemo, useCallback, useEffect} from 'react';
import { getParserInstance } from '../parser/mockParser';
import type {
  EditorState,
  ParseResult,
  ContentChange
} from "@/types/editor";

// 本地存储的键名
const STORAGE_KEY = 'markdown_editor_content';
const AUTOSAVE_DELAY = 1000; // 自动保存延迟（毫秒）

// 从本地存储加载内容
const loadFromStorage = (): string => {
  try {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    return savedContent || '';
  } catch (error) {
    console.error('Failed to load content from localStorage:', error);
    return '';
  }
};

// 保存内容到本地存储
const saveToStorage = (content: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, content);
  } catch (error) {
    console.error('Failed to save content to localStorage:', error);
  }
};

// 编辑器初始状态配置
const initialEditorState: EditorState = {
  content: loadFromStorage(), // 从本地存储加载初始内容
  selection: { start: 0, end: 0 }, // 当前选区位置
  parseResult: {                  // 初始解析结果
    html: '',
    codeBlocks: [],
    meta: {
      wordCount: 0,
      statistics: { codeBlocks: 0, images: 0, links: 0, tables: 0 }
    }
  },
  history: {                      // 历史记录
    past: [],                     // 过去的状态
    future: []                    // 未来的状态（用于重做）
  },
  options: {                      // 编辑器功能配置
    features: {
      basic: {
        headings: true,
        textFormatting: {
          bold: true,
          italic: true,
          strikethrough: true
        }
      }
    }
  }
};

// 定义编辑器操作的类型
type EditorAction =
  | { type: 'UPDATE_CONTENT'; payload: { content: string; parseResult: ParseResult } }  // 更新内容
  | { type: 'UPDATE_SELECTION'; payload: { start: number; end: number } }              // 更新选区
  | { type: 'UNDO' }  // 撤销
  | { type: 'REDO' }; // 重做

// 编辑器状态的 reducer 函数：处理各种编辑器操作
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'UPDATE_CONTENT': {
      // 更新内容时，保存当前状态到历史记录，并更新内容和解析结果
      const { content, parseResult } = action.payload;
      const past = [...state.history.past, { content: state.content, parseResult: state.parseResult }];

      // 保持现有的选区状态
      const newState = {
        ...state,
        content,
        parseResult,
        history: {
          past: past.slice(-50), // 限制历史记录最多保存50条
          future: []            // 清空重做记录
        }
      };

      console.log('Reducer更新状态，新的选区:', newState.selection);
      return newState;
    }
    case 'UPDATE_SELECTION':
      // 更新选区位置
      return {
        ...state,
        selection: {
          start: action.payload.start,
          end: action.payload.end
        }
      };
    case 'UNDO': {
      // 撤销操作：恢复到上一个状态
      const previous = state.history.past[state.history.past.length - 1];
      if (!previous) return state; // 如果没有历史记录则不变

      const past = state.history.past.slice(0, -1);  // 移除最后一条历史记录
      const future = [
        { content: state.content, parseResult: state.parseResult }, // 保存当前状态到重做列表
        ...state.history.future
      ];

      return {
        ...state,
        content: previous.content,
        parseResult: previous.parseResult,
        history: { past, future }
      };
    }
    case 'REDO': {
      // 重做操作：恢复到下一个状态
      const next = state.history.future[0];
      if (!next) return state; // 如果没有重做记录则不变

      const future = state.history.future.slice(1);  // 移除第一条重做记录
      const past = [
        ...state.history.past,
        { content: state.content, parseResult: state.parseResult } // 保存当前状态到历史记录
      ];

      return {
        ...state,
        content: next.content,
        parseResult: next.parseResult,
        history: { past, future }
      };
    }
    default:
      return state;
  }
}

// 创建编辑器上下文
const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  handleContentUpdate: (content: string, changes: ContentChange[]) => Promise<void>;
} | null>(null);

// 编辑器上下文提供者组件
export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初始化解析器实例（使用 useMemo 确保只创建一次）
  const parser = useMemo(() => getParserInstance(), []);

  // 使用 useReducer 管理编辑器状态
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);

  // 使用防抖进行自动保存
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage(state.content);
      console.log('Content auto-saved to localStorage');
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [state.content]);

  // 初始化时解析已保存的内容
  useEffect(() => {
    const initializeContent = async () => {
      if (state.content) {
        try {
          const parseResult = await parser.parse(state.content, state.options);
          dispatch({
            type: 'UPDATE_CONTENT',
            payload: { content: state.content, parseResult }
          });
        } catch (error) {
          console.error('Failed to parse initial content:', error);
        }
      }
    };

    initializeContent();
  }, []);

  const handleContentUpdate = useCallback(async (
    content: string,
    changes: ContentChange[]
  ) => {
    try {
      console.log('handleContentUpdate 被调用，新内容:', content);

      // 根据是否有变更内容决定使用增量解析还是完整解析
      const parseResult = changes.length > 0
        ? parser.parseIncremental(content, changes, state.options)
        : parser.parse(content, state.options);

      console.log('开始更新编辑器状态');
      // 更新状态
      dispatch({
        type: 'UPDATE_CONTENT',
        payload: { content, parseResult }
      });
    } catch (error) {
      console.error('解析错误:', error);
    }
  }, [parser, state.options]);

  // 创建 Context 值（使用 useMemo 优化性能）
  const value = useMemo(() => ({
    state,
    dispatch,
    handleContentUpdate
  }), [state, handleContentUpdate]);

  // 提供上下文给子组件
  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

// 自定义 Hook：用于在组件中访问编辑器上下文
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
