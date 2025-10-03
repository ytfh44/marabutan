/**
 * Context System for Marabutan Framework
 * 
 * 提供完整的Context API，支持Provider/Consumer模式和自动订阅
 */

import { createElement } from '../vdom/createElement';
import type { VNode } from '../vdom/types';
import { contextRegistry } from './registry';
import type { 
  Context, 
  ProviderProps, 
  ConsumerProps,
  ContextId,
  ProviderComponent,
  ConsumerComponent,
  ContextSubscriber,
  ContextValue
} from './types';

/**
 * 特殊Symbol标识Provider VNode
 * 
 * @remarks
 * 在VDOM渲染过程中识别和特殊处理Provider节点
 */
export const ProviderSymbol = Symbol('ContextProvider');

/**
 * 特殊Symbol标识Consumer VNode
 * 
 * @remarks
 * 在VDOM渲染过程中识别和特殊处理Consumer节点
 */
export const ConsumerSymbol = Symbol('ContextConsumer');

/**
 * 创建Context对象（泛型支持）
 * 
 * @typeParam T - Context值的类型
 * @param defaultValue - 默认值（当没有Provider时使用）
 * @returns Context对象，包含Provider和Consumer组件
 * 
 * @example
 * ```typescript
 * // 创建主题context
 * interface ThemeType {
 *   theme: 'light' | 'dark';
 *   toggleTheme: () => void;
 * }
 * 
 * const ThemeContext = createContext<ThemeType>({
 *   theme: 'light',
 *   toggleTheme: () => {}
 * });
 * 
 * // 使用Provider
 * <ThemeContext.Provider value={{ theme: 'dark', toggleTheme }}>
 *   <App />
 * </ThemeContext.Provider>
 * 
 * // 使用Consumer
 * <ThemeContext.Consumer>
 *   {({ theme }) => <div>Current theme: {theme}</div>}
 * </ThemeContext.Consumer>
 * ```
 */
export function createContext<T>(defaultValue: T): Context<T> {
  // 使用Symbol作为唯一标识
  const id: ContextId = Symbol('Context');

  /**
   * Provider组件
   * 
   * @remarks
   * 向子组件树提供context值
   * 支持嵌套：内层Provider会覆盖外层的同一context
   */
  const Provider: ProviderComponent<T> = (props: ProviderProps<T>): VNode => {
    const { value, children } = props;
    
    // 注册Provider值到全局store
    // 这样即使不在渲染栈中也能访问到（用于跨组件通信）
    contextRegistry.setValue(id, value);
    
    // 进入Provider作用域（立即进入，不等createElement）
    contextRegistry.enterProvider(id, value);
    
    // 如果children是函数（Consumer），调用它
    let childVNode = children;
    if (typeof children === 'function' || (children && typeof children === 'object' && children.type)) {
      // children可能是VNode或Consumer函数的返回值
      // 如果是VNode，保持原样；如果需要渲染，已经在Consumer中处理
      childVNode = children;
    }
    
    // 退出Provider作用域
    contextRegistry.exitProvider();
    
    // 创建特殊的Provider VNode
    // 使用ProviderSymbol标记，在createElement中特殊处理
    return createElement(
      ProviderSymbol,
      { contextId: id, value },
      childVNode
    );
  };

  /**
   * Consumer组件
   * 
   * @remarks
   * 消费context值并渲染
   * 会自动订阅context变化（在组件包装器中实现）
   */
  const Consumer: ConsumerComponent<T> = (props: any): VNode => {
    // children可能在不同的位置：
    // 1. 直接在props.children（通过createElement传递）
    // 2. 在props本身（如果是直接调用）
    let childrenFn = props.children;
    
    // 如果props.children不是函数，检查props中的其他属性
    if (typeof childrenFn !== 'function') {
      // 可能children被传为第一个参数
      const keys = Object.keys(props);
      for (const key of keys) {
        if (typeof props[key] === 'function' && key !== 'children') {
          childrenFn = props[key];
          break;
        }
      }
    }
    
    // 获取当前context值
    // 优先从渲染栈获取（支持嵌套Provider）
    const value = contextRegistry.getValue(id, defaultValue);
    
    // 确保children是函数
    if (typeof childrenFn !== 'function') {
      console.error('Consumer children must be a function, got:', typeof childrenFn, props);
      return createElement('div', { style: { display: 'none' } });
    }
    
    // 调用render prop获取渲染内容
    const renderedChildren = childrenFn(value);
    
    // 创建特殊的Consumer VNode
    // 实际的订阅逻辑在组件包装器中处理（Phase 5）
    return createElement(
      ConsumerSymbol,
      { contextId: id, defaultValue },
      renderedChildren
    );
  };

  // 返回Context对象
  return {
    id,
    defaultValue,
    Provider,
    Consumer
  };
}

/**
 * Component instance interface for context usage
 * 用于类型检查的最小组件实例接口
 */
interface ContextAwareComponent {
  contextUnsubscribers?: Array<() => void>;
  forceUpdate?: () => void;
  [key: string]: unknown;
}

/**
 * 在组件中使用context（辅助函数）
 * 
 * @typeParam T - Context值的类型
 * @param context - Context对象
 * @param componentInstance - 组件实例
 * @returns 当前context值
 * 
 * @remarks
 * 这是一个辅助函数，允许在组件的view函数中直接使用context
 * 会自动订阅context变化并触发组件重渲染
 * 
 * @example
 * ```typescript
 * const MyComponent = createComponent({
 *   view: (state) => {
 *     const theme = useContextInComponent(ThemeContext, this);
 *     return <div className={theme.theme}>Content</div>;
 *   }
 * });
 * ```
 */
export function useContextInComponent<T>(
  context: Context<T>,
  componentInstance: ContextAwareComponent
): T {
  const value = contextRegistry.getValue(context.id, context.defaultValue);
  
  // 如果还没有订阅者数组，创建一个
  if (!componentInstance.contextUnsubscribers) {
    componentInstance.contextUnsubscribers = [];
  }
  
  // 检查是否已经订阅过这个context（避免重复订阅）
  const subscriptionKey = `__ctx_${context.id.toString()}`;
  const alreadySubscribed = componentInstance[subscriptionKey];
  
  if (!alreadySubscribed) {
    const unsubscribe = contextRegistry.subscribe(context.id, () => {
      // context变化时强制重渲染组件
      if (componentInstance.forceUpdate) {
        componentInstance.forceUpdate();
      }
    });
    
    componentInstance.contextUnsubscribers.push(unsubscribe);
    componentInstance[subscriptionKey] = true;
  }
  
  return value;
}

// ============================================================================
// 类型导出
// ============================================================================

export type {
  Context,
  ContextId,
  ProviderProps,
  ConsumerProps,
  ProviderComponent,
  ConsumerComponent,
  ContextSubscriber,
  ContextValue // 向后兼容
};

// 向后兼容的接口别名
export interface ContextProviderProps extends ProviderProps<any> {}
export interface ContextConsumerProps extends ConsumerProps<any> {}

// 导出注册表（用于高级使用和测试）
export { contextRegistry } from './registry';
