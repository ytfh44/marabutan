/**
 * Context API 与 MVI 架构深度集成示例
 * 
 * 展示 Context 如何在 MVI (Model-View-Intent) 架构中使用
 * 完整的数据流：Intent → Model → View → Context
 */

import { createContext, useContextInComponent } from '../context';
import { run } from '../mvi/core';
import { createComponent } from '../components/core';
import { createElement } from '../vdom/createElement';
import type { MVIApp } from '../mvi/types';
import type { VNode } from '../vdom/types';

// ============================================================================
// 示例 1: 简单的 MVI + Context 集成
// ============================================================================

/**
 * App Settings Context
 * 应用级别的配置信息
 */
export interface AppSettingsType {
  language: 'zh' | 'en';
  notifications: boolean;
  updateLanguage: (lang: 'zh' | 'en') => void;
  toggleNotifications: () => void;
}

export const AppSettingsContext = createContext<AppSettingsType>({
  language: 'zh',
  notifications: true,
  updateLanguage: () => console.warn('AppSettingsContext.Provider not found'),
  toggleNotifications: () => console.warn('AppSettingsContext.Provider not found')
});

/**
 * MVI 应用的状态类型
 */
interface AppState {
  language: 'zh' | 'en';
  notifications: boolean;
  messages: string[];
}

/**
 * MVI 应用的 Action 类型
 */
type AppAction =
  | { type: 'CHANGE_LANGUAGE'; language: 'zh' | 'en' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'ADD_MESSAGE'; message: string };

/**
 * 创建一个完整的 MVI 应用，使用 Context 传递配置
 * 
 * 这个示例展示了：
 * 1. 在 MVI 的 view 函数中使用 Provider
 * 2. Model 函数处理状态更新
 * 3. Intent 函数定义用户交互
 */
export function createSimpleMVIWithContext(): MVIApp<AppState, AppAction> {
  return {
    // 初始状态
    initialState: {
      language: 'zh',
      notifications: true,
      messages: []
    },

    // Intent: 定义用户可以执行的操作
    intent: (dispatch) => ({
      changeLanguage: (lang: 'zh' | 'en') =>
        dispatch({ type: 'CHANGE_LANGUAGE', language: lang }),
      toggleNotifications: () =>
        dispatch({ type: 'TOGGLE_NOTIFICATIONS' }),
      addMessage: (msg: string) =>
        dispatch({ type: 'ADD_MESSAGE', message: msg })
    }),

    // Model: 纯函数，处理状态转换
    model: (state, action) => {
      switch (action.type) {
        case 'CHANGE_LANGUAGE':
          return {
            ...state,
            language: action.language,
            messages: [
              ...state.messages,
              `语言切换为: ${action.language === 'zh' ? '中文' : 'English'}`
            ]
          };

        case 'TOGGLE_NOTIFICATIONS':
          return {
            ...state,
            notifications: !state.notifications,
            messages: [
              ...state.messages,
              `通知已${!state.notifications ? '启用' : '禁用'}`
            ]
          };

        case 'ADD_MESSAGE':
          return {
            ...state,
            messages: [...state.messages, action.message]
          };

        default:
          return state;
      }
    },

    // View: 渲染函数，使用 Context Provider 包裹
    view: (state) => {
      // 构造 Context 值
      const settingsValue: AppSettingsType = {
        language: state.language,
        notifications: state.notifications,
        updateLanguage: (lang) => ({ type: 'CHANGE_LANGUAGE', language: lang }),
        toggleNotifications: () => ({ type: 'TOGGLE_NOTIFICATIONS' })
      };

      // 使用 Provider 包裹整个应用
      return createElement(
        AppSettingsContext.Provider,
        { value: settingsValue },
        createElement('div', { className: 'mvi-app' },
          createElement('h1', {}, 'MVI + Context 集成示例'),
          
          // 语言切换
          createElement('div', { className: 'controls' },
            createElement('button', {
              onClick: () => ({ type: 'CHANGE_LANGUAGE', language: 'zh' }),
              disabled: state.language === 'zh'
            }, '中文'),
            createElement('button', {
              onClick: () => ({ type: 'CHANGE_LANGUAGE', language: 'en' }),
              disabled: state.language === 'en'
            }, 'English')
          ),

          // 通知开关
          createElement('div', { className: 'controls' },
            createElement('label', {},
              createElement('input', {
                type: 'checkbox',
                checked: state.notifications,
                onChange: () => ({ type: 'TOGGLE_NOTIFICATIONS' })
              }),
              ' 启用通知'
            )
          ),

          // 消息列表
          createElement('div', { className: 'messages' },
            createElement('h2', {}, '操作日志：'),
            createElement('ul', {},
              ...state.messages.map((msg, i) =>
                createElement('li', { key: i }, msg)
              )
            )
          ),

          // 子组件（消费 Context）
          SettingsDisplayComponent().render()
        )
      );
    },

    rootElement: '#app'
  };
}

/**
 * 子组件，使用 Consumer 访问 Context
 */
const SettingsDisplayComponent = createComponent({
  displayName: 'SettingsDisplay',
  initialState: {},

  view: () => {
    return createElement(
      AppSettingsContext.Consumer,
      {
        children: (settings: AppSettingsType) =>
          createElement('div', { className: 'settings-display' },
            createElement('h3', {}, '当前配置'),
            createElement('p', {}, `语言: ${settings.language}`),
            createElement('p', {}, `通知: ${settings.notifications ? '开启' : '关闭'}`)
          )
      }
    );
  }
});

// ============================================================================
// 示例 2: 复杂的 MVI + Context - Todo 应用
// ============================================================================

/**
 * Todo 数据类型
 */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

/**
 * Todo Context 类型
 */
export interface TodoContextType {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
}

/**
 * 创建 Todo Context
 */
export const TodoContext = createContext<TodoContextType>({
  todos: [],
  filter: 'all',
  addTodo: () => console.warn('TodoContext.Provider not found'),
  toggleTodo: () => console.warn('TodoContext.Provider not found'),
  deleteTodo: () => console.warn('TodoContext.Provider not found'),
  setFilter: () => console.warn('TodoContext.Provider not found')
});

/**
 * Todo 应用的状态
 */
interface TodoAppState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  newTodoText: string;
}

/**
 * Todo 应用的 Action
 */
type TodoAction =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'DELETE_TODO'; id: string }
  | { type: 'SET_FILTER'; filter: 'all' | 'active' | 'completed' }
  | { type: 'UPDATE_NEW_TODO'; text: string };

/**
 * 创建 Todo MVI 应用
 * 
 * 展示更复杂的状态管理和 Context 使用
 */
export function createTodoMVIApp(): MVIApp<TodoAppState, TodoAction> {
  return {
    initialState: {
      todos: [
        { id: '1', text: '学习 MVI 架构', completed: true, createdAt: Date.now() - 86400000 },
        { id: '2', text: '理解 Context API', completed: true, createdAt: Date.now() - 43200000 },
        { id: '3', text: '构建完整应用', completed: false, createdAt: Date.now() }
      ],
      filter: 'all',
      newTodoText: ''
    },

    intent: (dispatch) => ({
      addTodo: (text: string) => dispatch({ type: 'ADD_TODO', text }),
      toggleTodo: (id: string) => dispatch({ type: 'TOGGLE_TODO', id }),
      deleteTodo: (id: string) => dispatch({ type: 'DELETE_TODO', id }),
      setFilter: (filter: 'all' | 'active' | 'completed') =>
        dispatch({ type: 'SET_FILTER', filter }),
      updateNewTodo: (text: string) => dispatch({ type: 'UPDATE_NEW_TODO', text })
    }),

    model: (state, action) => {
      switch (action.type) {
        case 'ADD_TODO':
          if (!action.text.trim()) return state;
          const newTodo: Todo = {
            id: Date.now().toString(),
            text: action.text.trim(),
            completed: false,
            createdAt: Date.now()
          };
          return {
            ...state,
            todos: [...state.todos, newTodo],
            newTodoText: ''
          };

        case 'TOGGLE_TODO':
          return {
            ...state,
            todos: state.todos.map(todo =>
              todo.id === action.id
                ? { ...todo, completed: !todo.completed }
                : todo
            )
          };

        case 'DELETE_TODO':
          return {
            ...state,
            todos: state.todos.filter(todo => todo.id !== action.id)
          };

        case 'SET_FILTER':
          return { ...state, filter: action.filter };

        case 'UPDATE_NEW_TODO':
          return { ...state, newTodoText: action.text };

        default:
          return state;
      }
    },

    view: (state) => {
      // 过滤 todos
      const filteredTodos = state.todos.filter(todo => {
        if (state.filter === 'active') return !todo.completed;
        if (state.filter === 'completed') return todo.completed;
        return true;
      });

      // 构造 Context 值
      const todoContextValue: TodoContextType = {
        todos: filteredTodos,
        filter: state.filter,
        addTodo: (text: string) => ({ type: 'ADD_TODO', text }),
        toggleTodo: (id: string) => ({ type: 'TOGGLE_TODO', id }),
        deleteTodo: (id: string) => ({ type: 'DELETE_TODO', id }),
        setFilter: (filter) => ({ type: 'SET_FILTER', filter })
      };

      return createElement(
        TodoContext.Provider,
        { value: todoContextValue },
        createElement('div', { className: 'todo-app' },
          createElement('h1', {}, 'Todo 应用 (MVI + Context)'),

          // 输入框
          createElement('div', { className: 'todo-input' },
            createElement('input', {
              type: 'text',
              placeholder: '添加新任务...',
              value: state.newTodoText,
              onInput: (e: any) => ({
                type: 'UPDATE_NEW_TODO',
                text: e.target.value
              }),
              onKeyPress: (e: any) => {
                if (e.key === 'Enter' && state.newTodoText.trim()) {
                  return { type: 'ADD_TODO', text: state.newTodoText };
                }
              }
            }),
            createElement('button', {
              onClick: () => ({ type: 'ADD_TODO', text: state.newTodoText }),
              disabled: !state.newTodoText.trim()
            }, '添加')
          ),

          // 过滤器
          createElement('div', { className: 'todo-filters' },
            createElement('button', {
              className: state.filter === 'all' ? 'active' : '',
              onClick: () => ({ type: 'SET_FILTER', filter: 'all' })
            }, '全部'),
            createElement('button', {
              className: state.filter === 'active' ? 'active' : '',
              onClick: () => ({ type: 'SET_FILTER', filter: 'active' })
            }, '未完成'),
            createElement('button', {
              className: state.filter === 'completed' ? 'active' : '',
              onClick: () => ({ type: 'SET_FILTER', filter: 'completed' })
            }, '已完成')
          ),

          // 统计信息（使用子组件，消费 Context）
          TodoStatsComponent().render(),

          // Todo 列表（使用子组件，消费 Context）
          TodoListComponent().render()
        )
      );
    },

    rootElement: '#app'
  };
}

/**
 * Todo 统计组件
 * 展示如何在子组件中消费 Context
 */
const TodoStatsComponent = createComponent({
  displayName: 'TodoStats',
  initialState: {},

  view: () => {
    return createElement(
      TodoContext.Consumer,
      {
        children: (context: TodoContextType) => {
          const total = context.todos.length;
          const completed = context.todos.filter(t => t.completed).length;
          const active = total - completed;

          return createElement('div', { className: 'todo-stats' },
            createElement('p', {},
              `总计: ${total} | 已完成: ${completed} | 未完成: ${active}`
            )
          );
        }
      }
    );
  }
});

/**
 * Todo 列表组件
 * 使用 Consumer 访问 todos 和操作函数
 */
const TodoListComponent = createComponent({
  displayName: 'TodoList',
  initialState: {},

  view: () => {
    return createElement(
      TodoContext.Consumer,
      {
        children: (context: TodoContextType) =>
          createElement('ul', { className: 'todo-list' },
            ...context.todos.map(todo =>
              createElement('li', {
                key: todo.id,
                className: todo.completed ? 'completed' : ''
              },
                createElement('input', {
                  type: 'checkbox',
                  checked: todo.completed,
                  onChange: () => context.toggleTodo(todo.id)
                }),
                createElement('span', {}, todo.text),
                createElement('button', {
                  onClick: () => context.deleteTodo(todo.id)
                }, '删除')
              )
            )
          )
      }
    );
  }
});

// ============================================================================
// 示例 3: useContextInComponent 的使用
// ============================================================================

/**
 * 使用 useContextInComponent 的组件示例
 * 
 * 这个 helper 函数允许在组件的 view 函数中直接访问 Context，
 * 并自动订阅变化
 */
export const SmartComponent = createComponent({
  displayName: 'SmartComponent',
  initialState: {},

  // 使用 function 而不是箭头函数，以便访问 this
  view: function() {
    // 使用 useContextInComponent 直接访问 Context
    // 这会自动订阅 Context 变化，当 Context 更新时组件会重新渲染
    const settings = useContextInComponent(AppSettingsContext, this);

    return createElement('div', { className: 'smart-component' },
      createElement('h3', {}, 'Smart Component (使用 useContextInComponent)'),
      createElement('p', {}, `当前语言: ${settings.language}`),
      createElement('p', {}, `通知状态: ${settings.notifications ? '开启' : '关闭'}`),
      createElement('button', {
        onClick: () => settings.updateLanguage(settings.language === 'zh' ? 'en' : 'zh')
      }, '切换语言')
    );
  }
});

// ============================================================================
// 导出运行函数
// ============================================================================

/**
 * 运行简单的 MVI + Context 示例
 */
export function runSimpleMVIContext() {
  const app = createSimpleMVIWithContext();
  return run(app);
}

/**
 * 运行 Todo MVI 应用
 */
export function runTodoMVIApp() {
  const app = createTodoMVIApp();
  return run(app);
}

