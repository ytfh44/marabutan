/**
 * Context API 集成测试
 * 
 * 测试 Context 与 MVI、Components、Mixins 的集成功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { contextRegistry } from '../context';
import {
  ThemeContext,
  ThemeProvider,
  ThemedButton,
  ThemedCard,
  AuthContext,
  AuthProvider,
  LoginForm,
  UserProfile,
  CounterContext,
  CounterProvider,
  CounterDisplay,
  CounterControls,
  Dashboard
} from './context-examples';
import {
  AppSettingsContext,
  TodoContext,
  createSimpleMVIWithContext,
  createTodoMVIApp,
  SmartComponent
} from './context-mvi-integration';

describe('Context Integration Examples', () => {
  beforeEach(() => {
    // 每个测试前清理 Context 注册表
    contextRegistry.clear();
  });

  describe('Theme Context Integration', () => {
    it('should create ThemeContext with default values', () => {
      expect(ThemeContext).toBeDefined();
      expect(ThemeContext.defaultValue.theme).toBe('light');
      expect(ThemeContext.defaultValue.colors).toBeDefined();
      expect(ThemeContext.defaultValue.toggleTheme).toBeTypeOf('function');
    });

    it('should create ThemeProvider component', () => {
      const provider = ThemeProvider();
      
      expect(provider).toBeDefined();
      expect(provider.state).toBeDefined();
      expect(provider.state.theme).toBe('light');
      expect(provider.render).toBeTypeOf('function');
    });

    it('should toggle theme in ThemeProvider', () => {
      const provider = ThemeProvider();
      
      expect(provider.state.theme).toBe('light');
      
      // 触发主题切换
      provider.dispatch({ type: 'TOGGLE_THEME' });
      
      expect(provider.state.theme).toBe('dark');
      
      // 再次切换
      provider.dispatch({ type: 'TOGGLE_THEME' });
      
      expect(provider.state.theme).toBe('light');
    });

    it('should create ThemedButton component', () => {
      const button = ThemedButton();
      
      expect(button).toBeDefined();
      expect(button.render).toBeTypeOf('function');
      
      // 渲染组件
      const vnode = button.render();
      expect(vnode).toBeDefined();
    });

    it('should create ThemedCard component', () => {
      const card = ThemedCard();
      
      expect(card).toBeDefined();
      expect(card.state.title).toBe('卡片标题');
      expect(card.state.content).toBeDefined();
    });
  });

  describe('Auth Context Integration', () => {
    it('should create AuthContext with default values', () => {
      expect(AuthContext).toBeDefined();
      expect(AuthContext.defaultValue.user).toBeNull();
      expect(AuthContext.defaultValue.isAuthenticated).toBe(false);
      expect(AuthContext.defaultValue.isLoading).toBe(false);
      expect(AuthContext.defaultValue.login).toBeTypeOf('function');
      expect(AuthContext.defaultValue.logout).toBeTypeOf('function');
    });

    it('should create AuthProvider component', () => {
      const provider = AuthProvider();
      
      expect(provider).toBeDefined();
      expect(provider.state.user).toBeNull();
      expect(provider.state.isLoading).toBe(false);
    });

    it('should handle login flow in AuthProvider', async () => {
      const provider = AuthProvider();
      
      expect(provider.state.user).toBeNull();
      
      // 开始登录
      provider.dispatch({ type: 'LOGIN_START' });
      expect(provider.state.isLoading).toBe(true);
      
      // 登录成功
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      };
      provider.dispatch({ type: 'LOGIN_SUCCESS', user: mockUser });
      
      expect(provider.state.user).toEqual(mockUser);
      expect(provider.state.isLoading).toBe(false);
    });

    it('should handle logout in AuthProvider', () => {
      const provider = AuthProvider();
      
      // 先设置为已登录状态
      provider.dispatch({
        type: 'LOGIN_SUCCESS',
        user: { id: '1', username: 'test', email: 'test@test.com', roles: [] }
      });
      
      expect(provider.state.user).not.toBeNull();
      
      // 登出
      provider.dispatch({ type: 'LOGOUT' });
      
      expect(provider.state.user).toBeNull();
    });

    it('should handle login error', () => {
      const provider = AuthProvider();
      
      provider.dispatch({ type: 'LOGIN_START' });
      expect(provider.state.isLoading).toBe(true);
      
      provider.dispatch({ type: 'LOGIN_ERROR', error: '登录失败' });
      
      expect(provider.state.isLoading).toBe(false);
      expect(provider.state.error).toBe('登录失败');
    });

    it('should create LoginForm component', () => {
      const form = LoginForm();
      
      expect(form).toBeDefined();
      expect(form.state.username).toBe('');
      expect(form.state.password).toBe('');
    });

    it('should update form fields in LoginForm', () => {
      const form = LoginForm();
      
      form.dispatch({ type: 'UPDATE_USERNAME', value: 'testuser' });
      expect(form.state.username).toBe('testuser');
      
      form.dispatch({ type: 'UPDATE_PASSWORD', value: 'password123' });
      expect(form.state.password).toBe('password123');
      
      form.dispatch({ type: 'CLEAR_FORM' });
      expect(form.state.username).toBe('');
      expect(form.state.password).toBe('');
    });

    it('should create UserProfile component', () => {
      const profile = UserProfile();
      
      expect(profile).toBeDefined();
      expect(profile.render).toBeTypeOf('function');
    });
  });

  describe('Counter Context Integration', () => {
    it('should create CounterContext with default values', () => {
      expect(CounterContext).toBeDefined();
      expect(CounterContext.defaultValue.count).toBe(0);
      expect(CounterContext.defaultValue.increment).toBeTypeOf('function');
      expect(CounterContext.defaultValue.decrement).toBeTypeOf('function');
      expect(CounterContext.defaultValue.reset).toBeTypeOf('function');
    });

    it('should create CounterProvider with mixins', () => {
      const provider = CounterProvider();
      
      expect(provider).toBeDefined();
      expect(provider.state.displayValue).toBe(0);
      // 检查 mixins 是否被应用
      expect((provider.state as any).counter).toBeDefined();
    });

    it('should handle counter operations', () => {
      const provider = CounterProvider();
      
      expect(provider.state.displayValue).toBe(0);
      
      // 增加
      provider.dispatch({ type: 'INCREMENT' });
      expect(provider.state.displayValue).toBe(1);
      
      provider.dispatch({ type: 'INCREMENT' });
      expect(provider.state.displayValue).toBe(2);
      
      // 减少
      provider.dispatch({ type: 'DECREMENT' });
      expect(provider.state.displayValue).toBe(1);
      
      // 重置
      provider.dispatch({ type: 'RESET' });
      expect(provider.state.displayValue).toBe(0);
    });

    it('should create CounterDisplay component', () => {
      const display = CounterDisplay();
      
      expect(display).toBeDefined();
      expect(display.render).toBeTypeOf('function');
    });

    it('should create CounterControls component', () => {
      const controls = CounterControls();
      
      expect(controls).toBeDefined();
      expect(controls.render).toBeTypeOf('function');
    });
  });

  describe('Multiple Context Nesting', () => {
    it('should create Dashboard with multiple contexts', () => {
      const dashboard = Dashboard();
      
      expect(dashboard).toBeDefined();
      expect(dashboard.render).toBeTypeOf('function');
    });

    it('should render Dashboard without errors', () => {
      const dashboard = Dashboard();
      
      expect(() => {
        dashboard.render();
      }).not.toThrow();
    });
  });

  describe('MVI Integration', () => {
    it('should create simple MVI app with context', () => {
      const app = createSimpleMVIWithContext();
      
      expect(app).toBeDefined();
      expect(app.initialState).toBeDefined();
      expect(app.intent).toBeTypeOf('function');
      expect(app.model).toBeTypeOf('function');
      expect(app.view).toBeTypeOf('function');
    });

    it('should handle language change in MVI app', () => {
      const app = createSimpleMVIWithContext();
      
      let state = app.initialState;
      expect(state.language).toBe('zh');
      
      // 切换语言
      state = app.model(state, { type: 'CHANGE_LANGUAGE', language: 'en' });
      expect(state.language).toBe('en');
      expect(state.messages).toContain('语言切换为: English');
    });

    it('should toggle notifications in MVI app', () => {
      const app = createSimpleMVIWithContext();
      
      let state = app.initialState;
      expect(state.notifications).toBe(true);
      
      // 切换通知
      state = app.model(state, { type: 'TOGGLE_NOTIFICATIONS' });
      expect(state.notifications).toBe(false);
      expect(state.messages).toContain('通知已禁用');
    });

    it('should create AppSettingsContext', () => {
      expect(AppSettingsContext).toBeDefined();
      expect(AppSettingsContext.defaultValue.language).toBe('zh');
      expect(AppSettingsContext.defaultValue.notifications).toBe(true);
    });
  });

  describe('Todo MVI Integration', () => {
    it('should create Todo MVI app', () => {
      const app = createTodoMVIApp();
      
      expect(app).toBeDefined();
      expect(app.initialState.todos).toHaveLength(3);
      expect(app.initialState.filter).toBe('all');
    });

    it('should add todo', () => {
      const app = createTodoMVIApp();
      
      let state = app.initialState;
      const initialCount = state.todos.length;
      
      // 添加新 todo
      state = app.model(state, { type: 'ADD_TODO', text: '新任务' });
      
      expect(state.todos).toHaveLength(initialCount + 1);
      expect(state.todos[state.todos.length - 1].text).toBe('新任务');
      expect(state.todos[state.todos.length - 1].completed).toBe(false);
    });

    it('should not add empty todo', () => {
      const app = createTodoMVIApp();
      
      let state = app.initialState;
      const initialCount = state.todos.length;
      
      // 尝试添加空 todo
      state = app.model(state, { type: 'ADD_TODO', text: '   ' });
      
      expect(state.todos).toHaveLength(initialCount);
    });

    it('should toggle todo completion', () => {
      const app = createTodoMVIApp();
      
      let state = app.initialState;
      const firstTodo = state.todos[0];
      const initialCompleted = firstTodo.completed;
      
      // 切换完成状态
      state = app.model(state, { type: 'TOGGLE_TODO', id: firstTodo.id });
      
      const updatedTodo = state.todos.find(t => t.id === firstTodo.id);
      expect(updatedTodo?.completed).toBe(!initialCompleted);
    });

    it('should delete todo', () => {
      const app = createTodoMVIApp();
      
      let state = app.initialState;
      const todoToDelete = state.todos[0];
      const initialCount = state.todos.length;
      
      // 删除 todo
      state = app.model(state, { type: 'DELETE_TODO', id: todoToDelete.id });
      
      expect(state.todos).toHaveLength(initialCount - 1);
      expect(state.todos.find(t => t.id === todoToDelete.id)).toBeUndefined();
    });

    it('should set filter', () => {
      const app = createTodoMVIApp();
      
      let state = app.initialState;
      expect(state.filter).toBe('all');
      
      state = app.model(state, { type: 'SET_FILTER', filter: 'active' });
      expect(state.filter).toBe('active');
      
      state = app.model(state, { type: 'SET_FILTER', filter: 'completed' });
      expect(state.filter).toBe('completed');
    });

    it('should update new todo text', () => {
      const app = createTodoMVIApp();
      
      let state = app.initialState;
      expect(state.newTodoText).toBe('');
      
      state = app.model(state, { type: 'UPDATE_NEW_TODO', text: '新任务文本' });
      expect(state.newTodoText).toBe('新任务文本');
    });

    it('should clear new todo text after adding', () => {
      const app = createTodoMVIApp();
      
      let state = app.initialState;
      state = app.model(state, { type: 'UPDATE_NEW_TODO', text: '新任务' });
      expect(state.newTodoText).toBe('新任务');
      
      state = app.model(state, { type: 'ADD_TODO', text: state.newTodoText });
      expect(state.newTodoText).toBe('');
    });

    it('should create TodoContext', () => {
      expect(TodoContext).toBeDefined();
      expect(TodoContext.defaultValue.todos).toEqual([]);
      expect(TodoContext.defaultValue.filter).toBe('all');
    });
  });

  describe('SmartComponent with useContextInComponent', () => {
    it('should create SmartComponent', () => {
      const component = SmartComponent();
      
      expect(component).toBeDefined();
      expect(component.render).toBeTypeOf('function');
    });

    it('should have forceUpdate method', () => {
      const component = SmartComponent();
      
      expect(component.forceUpdate).toBeDefined();
      expect(component.forceUpdate).toBeTypeOf('function');
    });

    it('should have contextUnsubscribers array', () => {
      const component = SmartComponent();
      
      expect(component.contextUnsubscribers).toBeDefined();
      expect(Array.isArray(component.contextUnsubscribers)).toBe(true);
    });
  });

  describe('Component Lifecycle with Context', () => {
    it('should clean up context subscriptions on destroy', () => {
      const component = SmartComponent();
      
      // 模拟添加订阅
      let cleanupCalled = false;
      const cleanup = () => {
        cleanupCalled = true;
      };
      
      component.contextUnsubscribers?.push(cleanup);
      
      // 销毁组件
      component.destroy();
      
      // 验证清理函数被调用
      expect(cleanupCalled).toBe(true);
      expect(component.contextUnsubscribers?.length).toBe(0);
    });

    it('should not error when destroying component multiple times', () => {
      const component = ThemedButton();
      
      expect(() => {
        component.destroy();
        component.destroy();
      }).not.toThrow();
    });
  });

  describe('Context Registry Integration', () => {
    it('should store context values in registry', () => {
      const provider = ThemeProvider();
      
      // 渲染 Provider 会将值存入 registry
      provider.render();
      
      // 验证值被存储
      const value = contextRegistry.getValue(ThemeContext.id, ThemeContext.defaultValue);
      expect(value).toBeDefined();
      expect(value.theme).toBeDefined();
    });

    it('should handle multiple providers of same context', () => {
      const provider1 = ThemeProvider();
      const provider2 = ThemeProvider();
      
      // 设置不同的主题
      provider1.dispatch({ type: 'TOGGLE_THEME' }); // dark
      provider2.dispatch({ type: 'TOGGLE_THEME' }); // dark
      provider2.dispatch({ type: 'TOGGLE_THEME' }); // light
      
      expect(provider1.state.theme).toBe('dark');
      expect(provider2.state.theme).toBe('light');
    });

    it('should isolate different context instances', () => {
      const themeProvider = ThemeProvider();
      const authProvider = AuthProvider();
      
      // 这两个 Provider 应该互不影响
      themeProvider.dispatch({ type: 'TOGGLE_THEME' });
      
      expect(themeProvider.state.theme).toBe('dark');
      expect(authProvider.state.user).toBeNull();
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety through context chain', () => {
      const provider = ThemeProvider();
      
      // TypeScript 应该知道 state.theme 的类型
      const theme: 'light' | 'dark' = provider.state.theme;
      expect(theme).toBeDefined();
    });

    it('should maintain type safety in MVI apps', () => {
      const app = createTodoMVIApp();
      
      // TypeScript 应该知道 state 的结构
      const todos = app.initialState.todos;
      expect(Array.isArray(todos)).toBe(true);
    });
  });
});

