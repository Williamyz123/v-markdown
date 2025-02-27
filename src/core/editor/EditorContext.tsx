// src/core/editor/EditorContext.tsx
import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import {getParserInstance, MockMarkdownParser} from '../parser/mockParser';
import type {
  EditorState,
  EditorAction,
  ParseResult,
  ContentChange, HistoryItem
} from "@/types/editor";
import type { EditorAPI } from "@/types/plugin";

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
  content: loadFromStorage(),
  selection: { start: 0, end: 0 },
  parseResult: {
    html: '',
    codeBlocks: [],
    meta: {
      wordCount: 0,
      statistics: { codeBlocks: 0, images: 0, links: 0, tables: 0 }
    }
  },
  history: {
    past: [],
    future: []
  },
  options: {
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

// 编辑器状态的 reducer 函数
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  // 创建一个函数来打印历史记录的变化
  const logHistoryChange = (past: HistoryItem[], future: HistoryItem[], type: string) => {
    // console.log(`History ${type} changed:`);
    // console.log('Past:', past);
    // console.log('Future:', future);
  };

  switch (action.type) {
    case 'UPDATE_CONTENT': {
      console.log("触发contentUpdate")
      const { content, parseResult } = action.payload;
      const past = [...state.history.past, {
        content: state.content,
        parseResult: state.parseResult
      }];
      // 打印历史记录变化
      logHistoryChange(past, state.history.future, 'changed');

      return {
        ...state,
        content,
        parseResult,
        history: {
          past: past.slice(-50), // 限制历史记录最多保存50条
          future: []
        }
      };
    }
    case 'UPDATE_SELECTION':
      return {
        ...state,
        selection: {
          start: action.payload.start,
          end: action.payload.end
        }
      };
    case 'UNDO': {
      console.log("触发undo")
      const previous = state.history.past[state.history.past.length - 1];
      if (!previous) return state;

      const past = state.history.past.slice(0, -1);
      const future = [
        { content: state.content, parseResult: state.parseResult },
        ...state.history.future
      ];
      // 打印历史记录变化
      logHistoryChange(past, state.history.future, 'changed');

      return {
        ...state,
        content: previous.content,
        parseResult: previous.parseResult,
        history: { past, future }
      };
    }
    case 'REDO': {
      const next = state.history.future[0];
      if (!next) return state;

      const future = state.history.future.slice(1);
      const past = [
        ...state.history.past,
        { content: state.content, parseResult: state.parseResult }
      ];
      // 打印历史记录变化
      logHistoryChange(past, state.history.future, 'changed');

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

// EditorContext 类型定义
type EditorContextType = {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  handleContentUpdate: (content: string, changes: ContentChange[]) => Promise<void>;
  editorAPI: EditorAPI['editor'];
};

// 创建编辑器上下文
const EditorContext = createContext<EditorContextType | null>(null);

// 编辑器上下文提供者组件
export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初始化解析器实例
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  const parser = useMemo(() => getParserInstance(initialEditorState.options), []);

  // 使用 ref 存储最新的状态
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 内容更新处理
  const handleContentUpdate = useCallback(async (
    content: string,
    changes: ContentChange[]
  ) => {
    try {
      const parseResult = changes.length > 0
        ? parser.parseIncremental(content, changes)
        : parser.parse(content);

      dispatch({
        type: 'UPDATE_CONTENT',
        payload: { content, parseResult }
      });
    } catch (error) {
      console.error('解析错误:', error);
    }
  }, [parser]);

  // 自动保存功能
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

  // 创建编辑器API
  const editorAPI = useMemo(() => ({
    getContent: () => stateRef.current.content,
    setContent: (content: string) => handleContentUpdate(content, []),
    getSelection: () => stateRef.current.selection,
    setSelection: (start: number, end: number) =>
      dispatch({ type: 'UPDATE_SELECTION', payload: { start, end } }),
    getState: () => stateRef.current,
    executeAction: (action: EditorAction) => dispatch(action)
  }), [handleContentUpdate]);

  // 创建 Context 值
  const value = useMemo(() => ({
    state,
    dispatch,
    handleContentUpdate,
    editorAPI
  }), [state, handleContentUpdate, editorAPI]);

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
