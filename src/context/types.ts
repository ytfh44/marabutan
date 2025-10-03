/**
 * Context API Type Definitions
 * 
 * 提供类型安全的Context系统，支持完整的TypeScript泛型
 */

import type { VNode } from '../vdom/types';

/**
 * Context唯一标识符（使用Symbol保证唯一性）
 * 
 * @remarks
 * 每个context实例都有一个唯一的Symbol ID，用于在全局注册表中区分不同的context
 */
export type ContextId = symbol;

/**
 * Provider组件的props类型
 * 
 * @typeParam T - Context值的类型
 */
export interface ProviderProps<T> {
  /** 要提供给子组件的context值 */
  value: T;
  /** 子组件 */
  children?: any;
}

/**
 * Consumer组件的props类型
 * 
 * @typeParam T - Context值的类型
 */
export interface ConsumerProps<T> {
  /** 渲染函数，接收context值并返回VNode */
  children: (value: T) => any;
}

/**
 * Provider组件类型
 * 
 * @typeParam T - Context值的类型
 */
export type ProviderComponent<T> = (props: ProviderProps<T>) => VNode;

/**
 * Consumer组件类型
 * 
 * @typeParam T - Context值的类型
 */
export type ConsumerComponent<T> = (props: ConsumerProps<T>) => VNode;

/**
 * Context对象接口（支持泛型）
 * 
 * @typeParam T - Context值的类型
 * 
 * 型变性说明（注释形式，因TypeScript限制无法使用显式型变标记）：
 * - T 理论上是协变的（covariant）- Context<T> 主要用于读取T
 * - 但由于 Provider 组件需要接受 T 类型的值作为输入（逆变位置），
 *   TypeScript 检测到型变冲突
 * - 实际上 Context<T> 应视为不变的（invariant）
 * - 如果需要型变行为，应在使用时显式转换类型
 * 
 * @example
 * ```typescript
 * interface ThemeType {
 *   theme: 'light' | 'dark';
 *   toggleTheme: () => void;
 * }
 * 
 * const ThemeContext: Context<ThemeType> = createContext({
 *   theme: 'light',
 *   toggleTheme: () => {}
 * });
 * ```
 */
export interface Context<T> {
  /** Context的唯一标识符 */
  readonly id: ContextId;
  /** 默认值（当没有Provider时使用） */
  readonly defaultValue: T;
  /** Provider组件 */
  readonly Provider: ProviderComponent<T>;
  /** Consumer组件 */
  readonly Consumer: ConsumerComponent<T>;
}

/**
 * Context订阅者回调函数
 * 
 * @remarks
 * 当context值发生变化时会被调用
 */
export type ContextSubscriber = () => void;

/**
 * Context值存储接口
 * 
 * @remarks
 * 在全局注册表中存储每个context的当前值和订阅者列表
 * 不变（invariant）- 值可以被读取和更新
 */
export interface ContextValueStore {
  /** 当前context值 */
  value: unknown;
  /** 订阅者集合 */
  subscribers: Set<ContextSubscriber>;
}

/**
 * 向后兼容的ContextValue类型
 * 
 * @deprecated 使用泛型Context<T>代替
 */
export interface ContextValue {
  [key: string]: any;
}

