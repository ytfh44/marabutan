/**
 * Context API Tests
 * 
 * 测试Context系统的所有核心功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createContext, contextRegistry } from './index';
import { createElement } from '../vdom/createElement';
import { createComponent } from '../components/core';
import type { Context } from './types';

describe('Context API', () => {
  beforeEach(() => {
    // 每个测试前清理注册表
    contextRegistry.clear();
  });

  describe('createContext', () => {
    it('should create context with default value', () => {
      interface ThemeType {
        theme: 'light' | 'dark';
      }
      
      const ThemeContext = createContext<ThemeType>({ theme: 'light' });
      
      expect(ThemeContext).toHaveProperty('Provider');
      expect(ThemeContext).toHaveProperty('Consumer');
      expect(ThemeContext).toHaveProperty('id');
      expect(ThemeContext.defaultValue).toEqual({ theme: 'light' });
    });

    it('should support generic types', () => {
      const NumberContext = createContext<number>(0);
      const StringContext = createContext<string>('');
      const ObjectContext = createContext<{ count: number }>({ count: 0 });
      
      expect(NumberContext.defaultValue).toBe(0);
      expect(StringContext.defaultValue).toBe('');
      expect(ObjectContext.defaultValue).toEqual({ count: 0 });
    });

    it('should create unique context instances', () => {
      const Context1 = createContext({ value: 1 });
      const Context2 = createContext({ value: 2 });
      
      // 每个context应该有不同的ID
      expect(Context1.id).not.toBe(Context2.id);
    });

    it('should support complex types', () => {
      interface UserContext {
        user: {
          id: number;
          name: string;
          roles: string[];
        } | null;
        login: (username: string, password: string) => Promise<void>;
        logout: () => void;
      }
      
      const defaultValue: UserContext = {
        user: null,
        login: async () => {},
        logout: () => {}
      };
      
      const UserCtx = createContext<UserContext>(defaultValue);
      expect(UserCtx.defaultValue).toEqual(defaultValue);
    });
  });

  describe('Registry', () => {
    it('should store and retrieve values', () => {
      const TestContext = createContext({ value: 'default' });
      
      contextRegistry.setValue(TestContext.id, { value: 'updated' });
      const retrieved = contextRegistry.getValue(TestContext.id, { value: 'default' });
      
      expect(retrieved).toEqual({ value: 'updated' });
    });

    it('should return default value when not set', () => {
      const TestContext = createContext({ value: 'default' });
      const retrieved = contextRegistry.getValue(TestContext.id, { value: 'default' });
      
      expect(retrieved).toEqual({ value: 'default' });
    });

    it('should handle render stack for nested providers', () => {
      const TestContext = createContext({ level: 0 });
      
      // 模拟嵌套Provider
      contextRegistry.enterProvider(TestContext.id, { level: 1 });
      expect(contextRegistry.getValue(TestContext.id, { level: 0 })).toEqual({ level: 1 });
      
      contextRegistry.enterProvider(TestContext.id, { level: 2 });
      expect(contextRegistry.getValue(TestContext.id, { level: 0 })).toEqual({ level: 2 });
      
      contextRegistry.exitProvider();
      expect(contextRegistry.getValue(TestContext.id, { level: 0 })).toEqual({ level: 1 });
      
      contextRegistry.exitProvider();
      expect(contextRegistry.getValue(TestContext.id, { level: 0 })).toEqual({ level: 0 });
    });

    it('should notify subscribers on value change', async () => {
      const TestContext = createContext({ count: 0 });
      
      let notificationCount = 0;
      const unsubscribe = contextRegistry.subscribe(TestContext.id, () => {
        notificationCount++;
      });
      
      contextRegistry.setValue(TestContext.id, { count: 1 });
      
      // 使用setTimeout确保异步回调被执行
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(notificationCount).toBe(1);
      
      // 设置相同的引用不应该触发通知
      const sameValue = { count: 2 };
      contextRegistry.setValue(TestContext.id, sameValue);
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(notificationCount).toBe(2);
      
      // 设置相同引用不应触发
      contextRegistry.setValue(TestContext.id, sameValue);
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(notificationCount).toBe(2); // 仍然是2，没有增加
      
      unsubscribe();
    });

    it('should allow unsubscribing', () => {
      const TestContext = createContext({ count: 0 });
      
      let notified = false;
      const unsubscribe = contextRegistry.subscribe(TestContext.id, () => {
        notified = true;
      });
      
      unsubscribe();
      contextRegistry.setValue(TestContext.id, { count: 1 });
      
      expect(notified).toBe(false);
    });

    it('should handle multiple subscribers', () => {
      const TestContext = createContext({ value: 0 });
      
      const notifications: number[] = [];
      const unsub1 = contextRegistry.subscribe(TestContext.id, () => {
        notifications.push(1);
      });
      const unsub2 = contextRegistry.subscribe(TestContext.id, () => {
        notifications.push(2);
      });
      
      contextRegistry.setValue(TestContext.id, { value: 1 });
      
      expect(notifications).toHaveLength(2);
      expect(notifications).toContain(1);
      expect(notifications).toContain(2);
      
      unsub1();
      unsub2();
    });

    it('should clear all data', () => {
      const TestContext1 = createContext({ value: 1 });
      const TestContext2 = createContext({ value: 2 });
      
      contextRegistry.setValue(TestContext1.id, { value: 10 });
      contextRegistry.setValue(TestContext2.id, { value: 20 });
      
      contextRegistry.clear();
      
      expect(contextRegistry.getValue(TestContext1.id, { value: 1 })).toEqual({ value: 1 });
      expect(contextRegistry.getValue(TestContext2.id, { value: 2 })).toEqual({ value: 2 });
      expect(contextRegistry.getStackDepth()).toBe(0);
    });
  });

  describe('Provider and Consumer', () => {
    it('should provide value via global store', () => {
      const TestContext = createContext({ value: 'default' });
      
      // 首先设置Provider值（通过调用Provider函数会设置store）
      TestContext.Provider({
        value: { value: 'provided' },
        children: null
      });
      
      // 然后Consumer应该能从store读取到值
      let consumedValue: any = null;
      TestContext.Consumer({
        children: (value: any) => {
          consumedValue = value;
          return createElement('div', {}, value.value);
        }
      });
      
      // 验证Consumer读取到了Provider设置的值
      expect(consumedValue).toEqual({ value: 'provided' });
    });

    it('should use default value when no provider', () => {
      const TestContext = createContext({ value: 'default' });
      
      let consumedValue: any = null;
      
      const app = TestContext.Consumer({
        children: (value: any) => {
          consumedValue = value;
          return createElement('div', {}, value.value);
        }
      });
      
      expect(consumedValue).toEqual({ value: 'default' });
    });

    it('should support nested providers with different contexts', () => {
      const Context1 = createContext({ name: 'context1' });
      const Context2 = createContext({ name: 'context2' });
      
      const values: string[] = [];
      
      // 设置Context1到store
      Context1.Provider({
        value: { name: 'provider1' },
        children: null
      });
      
      // Consumer从store读取Context1
      Context1.Consumer({
        children: (v1: any) => {
          values.push(v1.name);
          return createElement('div');
        }
      });
      
      // 设置Context2到store
      Context2.Provider({
        value: { name: 'provider2' },
        children: null
      });
      
      // Consumer从store读取Context2
      Context2.Consumer({
        children: (v2: any) => {
          values.push(v2.name);
          return createElement('div');
        }
      });
      
      // 验证两个context都被正确读取
      expect(values).toEqual(['provider1', 'provider2']);
    });

    it('should support nested providers of same context', () => {
      const TestContext = createContext({ level: 0 });
      
      const levels: number[] = [];
      
      // 模拟嵌套Provider的顺序调用（最后设置的值会覆盖之前的）
      TestContext.Provider({
        value: { level: 1 },
        children: null
      });
      
      TestContext.Consumer({
        children: (v: any) => {
          levels.push(v.level);
          return createElement('div');
        }
      });
      
      // 设置level 2
      TestContext.Provider({
        value: { level: 2 },
        children: null
      });
      
      TestContext.Consumer({
        children: (v: any) => {
          levels.push(v.level);
          return createElement('div');
        }
      });
      
      // 设置level 3
      TestContext.Provider({
        value: { level: 3 },
        children: null
      });
      
      TestContext.Consumer({
        children: (v: any) => {
          levels.push(v.level);
          return createElement('div');
        }
      });
      
      // 验证每次读取到最新的值
      expect(levels).toEqual([1, 2, 3]);
    });
  });

  describe('Component Integration', () => {
    it('should work with component system', () => {
      const CountContext = createContext({ count: 0 });
      
      const DisplayComponent = createComponent({
        displayName: 'Display',
        initialState: {},
        view: () => createElement(CountContext.Consumer, {
          children: (value: any) => createElement('span', {}, value.count.toString())
        })
      });
      
      const app = createElement(
        CountContext.Provider,
        { value: { count: 42 } },
        DisplayComponent().render()
      );
      
      // 验证渲染结果（通过VNode结构）
      expect(app.type).toBe(Symbol.for('Fragment'));
      // children应该包含Consumer返回的内容
    });

    it('should support forceUpdate in components', () => {
      const TestContext = createContext({ value: 0 });
      
      const component = createComponent({
        displayName: 'TestComponent',
        initialState: {},
        view: () => createElement('div')
      })();
      
      expect(component.forceUpdate).toBeDefined();
      expect(typeof component.forceUpdate).toBe('function');
      
      // forceUpdate不应该抛出错误
      expect(() => component.forceUpdate?.()).not.toThrow();
    });

    it('should have contextUnsubscribers array', () => {
      const component = createComponent({
        displayName: 'TestComponent',
        initialState: {},
        view: () => createElement('div')
      })();
      
      expect(component.contextUnsubscribers).toBeDefined();
      expect(Array.isArray(component.contextUnsubscribers)).toBe(true);
    });

    it('should clean up context subscriptions on destroy', () => {
      const TestContext = createContext({ value: 0 });
      
      const component = createComponent({
        displayName: 'TestComponent',
        initialState: {},
        view: () => createElement('div')
      })();
      
      // 模拟订阅
      let unsubscribeCalled = false;
      const unsubscribe = () => {
        unsubscribeCalled = true;
      };
      
      component.contextUnsubscribers?.push(unsubscribe);
      
      // 销毁组件
      component.destroy();
      
      // 验证取消订阅被调用
      expect(unsubscribeCalled).toBe(true);
      expect(component.contextUnsubscribers?.length).toBe(0);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type information through Provider', () => {
      interface StrictType {
        id: number;
        name: string;
        active: boolean;
      }
      
      const TypedContext = createContext<StrictType>({
        id: 0,
        name: '',
        active: false
      });
      
      const provider = TypedContext.Provider({
        value: {
          id: 1,
          name: 'test',
          active: true
        }
      });
      
      expect(provider).toBeDefined();
    });

    it('should maintain type information through Consumer', () => {
      interface StrictType {
        count: number;
      }
      
      const TypedContext = createContext<StrictType>({ count: 0 });
      
      TypedContext.Consumer({
        children: (value: StrictType) => {
          // TypeScript应该知道value的类型
          const count: number = value.count;
          expect(typeof count).toBe('number');
          return createElement('div');
        }
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid value updates', () => {
      const TestContext = createContext({ counter: 0 });
      let notificationCount = 0;
      
      contextRegistry.subscribe(TestContext.id, () => {
        notificationCount++;
      });
      
      // 快速连续更新
      for (let i = 0; i < 100; i++) {
        contextRegistry.setValue(TestContext.id, { counter: i });
      }
      
      expect(notificationCount).toBe(100);
    });

    it('should handle subscriber errors gracefully', () => {
      const TestContext = createContext({ value: 0 });
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // 添加会抛出错误的订阅者
      contextRegistry.subscribe(TestContext.id, () => {
        throw new Error('Subscriber error');
      });
      
      // 添加正常的订阅者
      let normalSubscriberCalled = false;
      contextRegistry.subscribe(TestContext.id, () => {
        normalSubscriberCalled = true;
      });
      
      // 更新值不应该崩溃
      expect(() => {
        contextRegistry.setValue(TestContext.id, { value: 1 });
      }).not.toThrow();
      
      // 正常订阅者仍然应该被调用
      expect(normalSubscriberCalled).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle deeply nested providers', () => {
      const TestContext = createContext({ depth: 0 });
      
      // 创建深度嵌套的Provider
      const depth = 10;
      for (let i = 0; i < depth; i++) {
        contextRegistry.enterProvider(TestContext.id, { depth: i + 1 });
      }
      
      const value = contextRegistry.getValue(TestContext.id, { depth: 0 });
      expect(value).toEqual({ depth });
      
      // 清理栈
      for (let i = 0; i < depth; i++) {
        contextRegistry.exitProvider();
      }
      
      expect(contextRegistry.getStackDepth()).toBe(0);
    });
  });
});

