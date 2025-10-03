/**
 * Context API 集成示例
 * 
 * 展示 Context API 与 MVI 架构、Components 和 Mixins 的完整集成
 */

import { createContext } from '../context';
import { createComponent } from '../components/core';
import { createElement } from '../vdom/createElement';
import type { VNode } from '../vdom/types';
import { counterMixin, loggingMixin } from './mixins';

// ============================================================================
// 1. Theme Context 示例 - 主题切换功能
// ============================================================================

/**
 * Theme Context 类型定义
 * 
 * 型变性说明（注释形式）：
 * - theme 属性是只读的（协变位置）
 * - toggleTheme 是函数（逆变位置），但不接受参数
 * - 整体 Context<ThemeContextType> 应视为不变的（invariant）
 */
export interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: {
    primary: string;
    background: string;
    text: string;
  };
  toggleTheme: () => void;
}

/**
 * 创建 Theme Context
 * 提供合理的默认值，确保在没有 Provider 时也能正常工作
 */
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: {
    primary: '#007bff',
    background: '#ffffff',
    text: '#000000'
  },
  toggleTheme: () => {
    console.warn('ThemeContext.Provider not found in component tree');
  }
});

/**
 * ThemeProvider 组件
 * 
 * 使用 Component 系统管理主题状态，并通过 Context 向下传递
 * 展示了 Context 与 Component 的集成
 */
export const ThemeProvider = createComponent<{
  theme: 'light' | 'dark';
  children?: VNode | VNode[];
}>({
  displayName: 'ThemeProvider',
  
  initialState: {
    theme: 'light' as 'light' | 'dark'
  },
  
  model: (state, action: any) => {
    switch (action.type) {
      case 'TOGGLE_THEME':
        return {
          ...state,
          theme: state.theme === 'light' ? 'dark' : 'light'
        };
      default:
        return state;
    }
  },
  
  view: (state, dispatch) => {
    // 根据当前主题计算颜色
    const colors = state.theme === 'light'
      ? {
          primary: '#007bff',
          background: '#ffffff',
          text: '#000000'
        }
      : {
          primary: '#4dabf7',
          background: '#1a1a1a',
          text: '#ffffff'
        };
    
    // 构造 Context 值
    const themeValue: ThemeContextType = {
      theme: state.theme,
      colors,
      toggleTheme: () => dispatch?.({ type: 'TOGGLE_THEME' })
    };
    
    // 使用 Provider 向下传递主题
    return createElement(
      ThemeContext.Provider,
      { value: themeValue },
      // children 从 props 传入（通过工厂函数）
      (state.children as any) || createElement('div', {}, '请提供 children')
    );
  }
});

/**
 * ThemedButton 组件
 * 
 * 使用 Consumer 消费主题 Context
 * 展示了如何在子组件中访问 Context
 */
export const ThemedButton = createComponent({
  displayName: 'ThemedButton',
  initialState: {},
  
  view: () => {
    return createElement(
      ThemeContext.Consumer,
      {
        children: (theme: ThemeContextType) => 
          createElement(
            'button',
            {
              style: {
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              },
              onClick: theme.toggleTheme
            },
            `切换到 ${theme.theme === 'light' ? '深色' : '浅色'} 模式`
          )
      }
    );
  }
});

/**
 * ThemedCard 组件
 * 
 * 另一个消费主题 Context 的组件
 */
export const ThemedCard = createComponent<{
  title?: string;
  content?: string;
}>({
  displayName: 'ThemedCard',
  initialState: {
    title: '卡片标题',
    content: '这是一个响应主题的卡片组件'
  },
  
  view: (state) => {
    return createElement(
      ThemeContext.Consumer,
      {
        children: (theme: ThemeContextType) =>
          createElement(
            'div',
            {
              style: {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.primary}`,
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px'
              }
            },
            createElement('h3', {}, state.title),
            createElement('p', {}, state.content)
          )
      }
    );
  }
});

// ============================================================================
// 2. Auth Context 示例 - 认证状态管理
// ============================================================================

/**
 * User 类型定义
 */
export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

/**
 * Auth Context 类型定义
 * 
 * 型变性说明：
 * - user 属性可能为 null（协变位置）
 * - login/logout 是函数（包含逆变参数）
 * - 整体应视为不变的（invariant）
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

/**
 * 创建 Auth Context
 */
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => {
    console.warn('AuthContext.Provider not found');
  },
  logout: () => {
    console.warn('AuthContext.Provider not found');
  }
});

/**
 * AuthProvider 组件
 * 
 * 管理用户认证状态
 * 展示了异步操作在 Context 中的处理
 */
export const AuthProvider = createComponent<{
  user: User | null;
  isLoading: boolean;
  error: string | null;
  children?: VNode | VNode[];
}>({
  displayName: 'AuthProvider',
  
  initialState: {
    user: null as User | null,
    isLoading: false,
    error: null as string | null
  },
  
  model: (state, action: any) => {
    switch (action.type) {
      case 'LOGIN_START':
        return { ...state, isLoading: true, error: null };
        
      case 'LOGIN_SUCCESS':
        return {
          ...state,
          user: action.user,
          isLoading: false,
          error: null
        };
        
      case 'LOGIN_ERROR':
        return {
          ...state,
          isLoading: false,
          error: action.error
        };
        
      case 'LOGOUT':
        return {
          ...state,
          user: null,
          error: null
        };
        
      default:
        return state;
    }
  },
  
  view: (state, dispatch) => {
    // 模拟登录函数
    const login = async (username: string, password: string) => {
      dispatch?.({ type: 'LOGIN_START' });
      
      try {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟成功登录
        const user: User = {
          id: '1',
          username,
          email: `${username}@example.com`,
          roles: ['user']
        };
        
        dispatch?.({ type: 'LOGIN_SUCCESS', user });
      } catch (error) {
        dispatch?.({
          type: 'LOGIN_ERROR',
          error: error instanceof Error ? error.message : '登录失败'
        });
      }
    };
    
    // 登出函数
    const logout = () => {
      dispatch?.({ type: 'LOGOUT' });
    };
    
    // 构造 Context 值
    const authValue: AuthContextType = {
      user: state.user,
      isAuthenticated: state.user !== null,
      isLoading: state.isLoading,
      login,
      logout
    };
    
    return createElement(
      AuthContext.Provider,
      { value: authValue },
      (state.children as any) || createElement('div', {}, '请提供 children')
    );
  }
});

/**
 * LoginForm 组件
 * 
 * 使用 Auth Context 进行登录
 */
export const LoginForm = createComponent<{
  username: string;
  password: string;
}>({
  displayName: 'LoginForm',
  
  initialState: {
    username: '',
    password: ''
  },
  
  model: (state, action: any) => {
    switch (action.type) {
      case 'UPDATE_USERNAME':
        return { ...state, username: action.value };
      case 'UPDATE_PASSWORD':
        return { ...state, password: action.value };
      case 'CLEAR_FORM':
        return { ...state, username: '', password: '' };
      default:
        return state;
    }
  },
  
  view: (state, dispatch) => {
    return createElement(
      AuthContext.Consumer,
      {
        children: (auth: AuthContextType) => {
          const handleSubmit = (e: Event) => {
            e.preventDefault();
            auth.login(state.username, state.password);
            dispatch?.({ type: 'CLEAR_FORM' });
          };
          
          if (auth.isAuthenticated) {
            return createElement('div', {},
              createElement('p', {}, `欢迎回来，${auth.user?.username}！`),
              createElement('button', { onClick: auth.logout }, '退出登录')
            );
          }
          
          return createElement('form', { onSubmit: handleSubmit },
            createElement('h2', {}, '登录'),
            createElement('div', {},
              createElement('input', {
                type: 'text',
                placeholder: '用户名',
                value: state.username,
                onInput: (e: any) => dispatch?.({
                  type: 'UPDATE_USERNAME',
                  value: e.target.value
                })
              })
            ),
            createElement('div', {},
              createElement('input', {
                type: 'password',
                placeholder: '密码',
                value: state.password,
                onInput: (e: any) => dispatch?.({
                  type: 'UPDATE_PASSWORD',
                  value: e.target.value
                })
              })
            ),
            createElement('button', {
              type: 'submit',
              disabled: auth.isLoading || !state.username || !state.password
            }, auth.isLoading ? '登录中...' : '登录')
          );
        }
      }
    );
  }
});

/**
 * UserProfile 组件
 * 
 * 显示当前登录用户的信息
 */
export const UserProfile = createComponent({
  displayName: 'UserProfile',
  initialState: {},
  
  view: () => {
    return createElement(
      AuthContext.Consumer,
      {
        children: (auth: AuthContextType) => {
          if (!auth.isAuthenticated || !auth.user) {
            return createElement('div', {}, '请先登录');
          }
          
          return createElement('div', { className: 'user-profile' },
            createElement('h3', {}, '用户资料'),
            createElement('p', {}, `用户名: ${auth.user.username}`),
            createElement('p', {}, `邮箱: ${auth.user.email}`),
            createElement('p', {}, `角色: ${auth.user.roles.join(', ')}`)
          );
        }
      }
    );
  }
});

// ============================================================================
// 3. Counter Context 示例 - 全局计数器（与 Mixins 集成）
// ============================================================================

/**
 * Counter Context 类型定义
 */
export interface CounterContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

/**
 * 创建 Counter Context
 */
export const CounterContext = createContext<CounterContextType>({
  count: 0,
  increment: () => console.warn('CounterContext.Provider not found'),
  decrement: () => console.warn('CounterContext.Provider not found'),
  reset: () => console.warn('CounterContext.Provider not found')
});

/**
 * CounterProvider 组件
 * 
 * 展示 Context 与 Mixins 的集成
 * 使用 counterMixin 管理计数器逻辑
 */
export const CounterProvider = createComponent({
  displayName: 'CounterProvider',
  
  initialState: {
    displayValue: 0,
    children: undefined as VNode | VNode[] | undefined
  },
  
  // 集成 counter mixin
  mixins: {
    counter: counterMixin,
    logger: loggingMixin
  } as any,
  
  model: (state, action: any) => {
    let newState = state;
    
    // 处理计数器操作
    if (action.type === 'INCREMENT' || action.type === 'DECREMENT' || action.type === 'RESET') {
      const counterState = (state as any).counter;
      if (counterState && typeof counterState === 'object') {
        const updatedCounter = { ...counterState };
        switch (action.type) {
          case 'INCREMENT':
            updatedCounter.count = (updatedCounter.count || 0) + 1;
            break;
          case 'DECREMENT':
            updatedCounter.count = (updatedCounter.count || 0) - 1;
            break;
          case 'RESET':
            updatedCounter.count = 0;
            break;
        }
        newState = { ...state, counter: updatedCounter } as any;
      }
    }
    
    // 更新显示值
    const mixedState = newState as any;
    if (mixedState.counter && mixedState.counter.count !== undefined) {
      newState = { ...newState, displayValue: mixedState.counter.count };
    }
    
    return newState;
  },
  
  view: (state, dispatch) => {
    // 构造 Context 值
    const counterValue: CounterContextType = {
      count: state.displayValue,
      increment: () => dispatch?.({ type: 'INCREMENT' }),
      decrement: () => dispatch?.({ type: 'DECREMENT' }),
      reset: () => dispatch?.({ type: 'RESET' })
    };
    
    return createElement(
      CounterContext.Provider,
      { value: counterValue },
      (state.children as any) || createElement('div', {}, '请提供 children')
    );
  }
});

/**
 * CounterDisplay 组件
 * 
 * 显示计数器当前值
 */
export const CounterDisplay = createComponent({
  displayName: 'CounterDisplay',
  initialState: {},
  
  view: () => {
    return createElement(
      CounterContext.Consumer,
      {
        children: (counter: CounterContextType) =>
          createElement('div', { className: 'counter-display' },
            createElement('h2', {}, `当前计数: ${counter.count}`)
          )
      }
    );
  }
});

/**
 * CounterControls 组件
 * 
 * 计数器控制按钮
 */
export const CounterControls = createComponent({
  displayName: 'CounterControls',
  initialState: {},
  
  view: () => {
    return createElement(
      CounterContext.Consumer,
      {
        children: (counter: CounterContextType) =>
          createElement('div', { className: 'counter-controls' },
            createElement('button', { onClick: counter.decrement }, '-'),
            createElement('button', { onClick: counter.reset }, '重置'),
            createElement('button', { onClick: counter.increment }, '+')
          )
      }
    );
  }
});

// ============================================================================
// 4. 多 Context 嵌套示例 - 完整的应用
// ============================================================================

/**
 * Dashboard 组件
 * 
 * 展示多个 Context 的嵌套使用
 * 同时消费 Theme、Auth 和 Counter Context
 */
export const Dashboard = createComponent({
  displayName: 'Dashboard',
  initialState: {},
  
  view: () => {
    return createElement(
      ThemeContext.Consumer,
      {
        children: (theme: ThemeContextType) =>
          createElement(
            AuthContext.Consumer,
            {
              children: (auth: AuthContextType) =>
                createElement(
                  CounterContext.Consumer,
                  {
                    children: (counter: CounterContextType) =>
                      createElement(
                        'div',
                        {
                          style: {
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            padding: '20px',
                            minHeight: '100vh'
                          }
                        },
                        createElement('h1', {}, '集成示例面板'),
                        createElement('p', {},
                          `当前主题: ${theme.theme}, ` +
                          `用户: ${auth.isAuthenticated ? auth.user?.username : '未登录'}, ` +
                          `计数: ${counter.count}`
                        ),
                        
                        // Theme 控制
                        createElement('section', {},
                          createElement('h2', {}, '主题控制'),
                          ThemedButton().render()
                        ),
                        
                        // Auth 控制
                        createElement('section', {},
                          createElement('h2', {}, '认证状态'),
                          LoginForm().render()
                        ),
                        
                        // Counter 控制
                        createElement('section', {},
                          createElement('h2', {}, '计数器'),
                          CounterDisplay().render(),
                          CounterControls().render()
                        )
                      )
                  }
                )
            }
          )
      }
    );
  }
});

/**
 * 完整的应用示例
 * 
 * 展示如何组合多个 Provider
 */
export function createMultiContextApp() {
  const ThemeProviderInstance = ThemeProvider();
  const AuthProviderInstance = AuthProvider();
  const CounterProviderInstance = CounterProvider();
  const DashboardInstance = Dashboard();
  
  // 渲染嵌套的 Provider 结构
  // ThemeProvider -> AuthProvider -> CounterProvider -> Dashboard
  const app = ThemeProviderInstance.render();
  
  return {
    theme: ThemeProviderInstance,
    auth: AuthProviderInstance,
    counter: CounterProviderInstance,
    dashboard: DashboardInstance,
    vnode: app
  };
}

