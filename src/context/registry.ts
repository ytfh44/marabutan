/**
 * Context Registry
 * 
 * 全局Context注册表，使用Symbol作为键保证唯一性
 * 管理所有context的值、订阅者和渲染栈
 */

import type { ContextId, ContextValueStore, ContextSubscriber } from './types';

/**
 * 全局Context注册表类
 * 
 * @remarks
 * 采用单例模式，全局只有一个注册表实例
 * 使用Symbol作为键，确保不同context之间不会冲突
 * 
 * 主要功能：
 * - 存储和管理所有context的当前值
 * - 管理订阅者和通知机制
 * - 维护渲染栈以支持嵌套Provider
 */
class ContextRegistry {
  /**
   * 存储所有context的当前值和订阅者
   * 
   * @remarks
   * Key: Context的Symbol ID
   * Value: { value: 当前值, subscribers: 订阅者集合 }
   */
  private store = new Map<ContextId, ContextValueStore>();
  
  /**
   * 渲染栈，用于跟踪当前活跃的Provider
   * 
   * @remarks
   * 支持嵌套Provider：内层Provider会覆盖外层的同一context值
   * 栈结构确保正确的作用域管理
   */
  private renderStack: Array<{ id: ContextId; value: any }> = [];

  /**
   * 设置context值（Provider调用）
   * 
   * @typeParam T - Context值的类型
   * @param id - Context的唯一标识符
   * @param value - 新的context值
   * 
   * @remarks
   * 如果值发生变化，会自动通知所有订阅者
   */
  setValue<T>(id: ContextId, value: T): void {
    let entry = this.store.get(id);
    if (!entry) {
      entry = { value, subscribers: new Set() };
      this.store.set(id, entry);
    } else {
      const oldValue = entry.value;
      entry.value = value;
      
      // 如果值改变（使用引用比较），通知所有订阅者
      if (oldValue !== value) {
        this.notifySubscribers(id);
      }
    }
  }

  /**
   * 获取context值（Consumer调用）
   * 
   * @typeParam T - Context值的类型
   * @param id - Context的唯一标识符
   * @param defaultValue - 默认值（当没有Provider时使用）
   * @returns 当前context值
   * 
   * @remarks
   * 查找顺序：
   * 1. 从渲染栈中查找（支持嵌套Provider，后进先出）
   * 2. 从store中查找
   * 3. 返回defaultValue
   */
  getValue<T>(id: ContextId, defaultValue: T): T {
    // 优先从渲染栈查找（支持嵌套Provider，从后往前找）
    for (let i = this.renderStack.length - 1; i >= 0; i--) {
      if (this.renderStack[i].id === id) {
        return this.renderStack[i].value;
      }
    }
    
    // 然后从store查找
    const entry = this.store.get(id);
    return entry ? entry.value : defaultValue;
  }

  /**
   * 订阅context变化
   * 
   * @param id - Context的唯一标识符
   * @param subscriber - 订阅者回调函数
   * @returns 取消订阅函数
   * 
   * @example
   * ```typescript
   * const unsubscribe = contextRegistry.subscribe(myContext.id, () => {
   *   console.log('Context changed!');
   * });
   * 
   * // 稍后取消订阅
   * unsubscribe();
   * ```
   */
  subscribe(id: ContextId, subscriber: ContextSubscriber): () => void {
    let entry = this.store.get(id);
    if (!entry) {
      entry = { value: undefined, subscribers: new Set() };
      this.store.set(id, entry);
    }
    
    entry.subscribers.add(subscriber);
    
    // 返回取消订阅函数
    return () => {
      entry?.subscribers.delete(subscriber);
    };
  }

  /**
   * 通知所有订阅者
   * 
   * @param id - Context的唯一标识符
   * 
   * @remarks
   * 会捕获并记录订阅者回调中的错误，防止一个订阅者出错影响其他订阅者
   */
  private notifySubscribers(id: ContextId): void {
    const entry = this.store.get(id);
    if (entry) {
      entry.subscribers.forEach(subscriber => {
        try {
          subscriber();
        } catch (error) {
          console.error('Context subscriber error:', error);
        }
      });
    }
  }

  /**
   * 进入Provider渲染（push到栈）
   * 
   * @param id - Context的唯一标识符
   * @param value - Provider提供的值
   * 
   * @remarks
   * 在渲染Provider的children之前调用
   */
  enterProvider(id: ContextId, value: any): void {
    this.renderStack.push({ id, value });
  }

  /**
   * 退出Provider渲染（pop栈）
   * 
   * @remarks
   * 在渲染Provider的children之后调用
   */
  exitProvider(): void {
    this.renderStack.pop();
  }

  /**
   * 清理所有context数据（主要用于测试）
   * 
   * @remarks
   * 清空store和renderStack，恢复到初始状态
   */
  clear(): void {
    this.store.clear();
    this.renderStack = [];
  }

  /**
   * 获取当前渲染栈深度（用于调试）
   * 
   * @returns 渲染栈深度
   */
  getStackDepth(): number {
    return this.renderStack.length;
  }

  /**
   * 获取context的订阅者数量（用于调试和监控）
   * 
   * @param id - Context的唯一标识符
   * @returns 订阅者数量
   */
  getSubscriberCount(id: ContextId): number {
    const entry = this.store.get(id);
    return entry ? entry.subscribers.size : 0;
  }
}

/**
 * 全局Context注册表单例
 * 
 * @example
 * ```typescript
 * import { contextRegistry } from './context/registry';
 * 
 * // 设置值
 * contextRegistry.setValue(myContext.id, newValue);
 * 
 * // 获取值
 * const value = contextRegistry.getValue(myContext.id, defaultValue);
 * 
 * // 订阅
 * const unsubscribe = contextRegistry.subscribe(myContext.id, callback);
 * ```
 */
export const contextRegistry = new ContextRegistry();

