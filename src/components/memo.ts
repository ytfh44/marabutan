/**
 * Memo Component Utilities for Marabutan Framework
 * 提供React.memo风格的组件缓存功能，避免不必要的重渲染
 */

import type { VNode, ComponentFunction } from '../vdom/types';
import { shallowEqual } from '../utils/comparison';

/**
 * Props比较函数类型
 * 
 * @typeParam P - Props类型
 * @param prevProps - 上一次的props
 * @param nextProps - 新的props
 * @returns 如果props相等（不需要重渲染），返回true
 */
export type PropsAreEqual<P> = (prevProps: P, nextProps: P) => boolean;

/**
 * 创建一个记忆化的函数组件
 * 
 * @typeParam P - Props类型
 * @param component - 要记忆化的函数组件
 * @param arePropsEqual - 可选的props比较函数，默认使用浅比较
 * @returns 记忆化的组件
 * 
 * @remarks
 * - 当props相同时，返回缓存的VNode，避免重新执行组件函数
 * - 默认使用浅比较（shallowEqual）比较props
 * - 可以提供自定义比较函数来控制何时重渲染
 * - 类似React.memo，但不支持ref和children特殊处理
 * 
 * @example
 * ```typescript
 * // 基本用法
 * const ExpensiveComponent = memo(({ data }) => {
 *   const processed = expensiveCalculation(data);
 *   return <div>{processed}</div>;
 * });
 * 
 * // 自定义比较函数
 * const CustomComponent = memo(
 *   ({ user }) => <div>{user.name}</div>,
 *   (prev, next) => prev.user.id === next.user.id
 * );
 * ```
 */
export function memo<P = any>(
  component: ComponentFunction<P>,
  arePropsEqual?: PropsAreEqual<P>
): ComponentFunction<P> {
  // 缓存上一次的props和VNode
  let cachedProps: P | null = null;
  let cachedVNode: VNode | null = null;
  let isInitialized = false; // 区分"未渲染"和"渲染结果为null"
  let renderCount = 0;

  // 返回包装后的组件
  return (props: P): VNode | null => {
    // 首次渲染
    if (!isInitialized) {
      cachedProps = props;
      cachedVNode = component(props);
      isInitialized = true;
      renderCount++;
      return cachedVNode;
    }

    // 比较props
    const shouldUpdate = arePropsEqual
      ? !arePropsEqual(cachedProps!, props)
      : !shallowEqual(cachedProps, props);

    // Props相同，返回缓存的VNode
    if (!shouldUpdate) {
      return cachedVNode;
    }

    // Props不同，重新渲染
    cachedProps = props;
    cachedVNode = component(props);
    renderCount++;
    return cachedVNode;
  };
}

/**
 * 创建一个纯组件（Pure Component）
 * 
 * @typeParam P - Props类型
 * @param component - 要转换为纯组件的函数组件
 * @returns 纯组件（使用深度比较）
 * 
 * @remarks
 * - 使用深度比较（而非浅比较）来决定是否重渲染
 * - 性能开销比memo更大，但更准确
 * - 适用于props是复杂嵌套对象的场景
 * 
 * @example
 * ```typescript
 * const PureComponent = pure(({ config }) => {
 *   return <div>{JSON.stringify(config)}</div>;
 * });
 * ```
 */
export function pure<P = any>(
  component: ComponentFunction<P>
): ComponentFunction<P> {
  return memo(component, (prevProps, nextProps) => {
    // 使用深度比较（简化版，实际可能需要更复杂的实现）
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
}

/**
 * 创建一个带名称的memo组件（用于调试）
 * 
 * @typeParam P - Props类型
 * @param displayName - 组件显示名称
 * @param component - 要记忆化的函数组件
 * @param arePropsEqual - 可选的props比较函数
 * @returns 记忆化的组件（带名称）
 * 
 * @example
 * ```typescript
 * const MyComponent = memoWithName('MyComponent', ({ value }) => {
 *   return <div>{value}</div>;
 * });
 * ```
 */
export function memoWithName<P = any>(
  displayName: string,
  component: ComponentFunction<P>,
  arePropsEqual?: PropsAreEqual<P>
): ComponentFunction<P> {
  const memoized = memo(component, arePropsEqual);
  (memoized as any).displayName = displayName;
  return memoized;
}

/**
 * 获取组件的渲染统计信息（用于性能调试）
 * 
 * @param component - 组件函数
 * @returns 渲染次数和其他统计信息
 * 
 * @remarks
 * 这是一个实验性API，用于调试memo组件的性能
 * 需要在组件上附加__stats属性
 */
export function getComponentStats(component: ComponentFunction<any>): {
  renderCount: number;
  displayName?: string;
} {
  const stats = (component as any).__stats;
  return {
    renderCount: stats?.renderCount || 0,
    displayName: (component as any).displayName
  };
}

/**
 * 清除组件的缓存（强制下次渲染时重新计算）
 * 
 * @param component - memo组件
 * 
 * @remarks
 * 这是一个实验性API，可能在未来版本中改变
 */
export function clearMemoCache(component: ComponentFunction<any>): void {
  if ((component as any).__clearCache) {
    (component as any).__clearCache();
  }
}

