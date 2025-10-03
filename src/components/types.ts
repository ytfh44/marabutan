import type { VNode } from '../vdom/types';
import type { MVIApp, Intent, Model, View, Dispatch } from '../mvi/types';
import type { Mixin, MixedState, MixinLifecycle } from '../mixins/types';

/**
 * Base props interface for all components
 */
export interface BaseProps {
  key?: string | number;
  children?: VNode[];
  className?: string;
  id?: string;
  style?: Record<string, string | number>;
}

/**
 * Component props interface with proper typing
 */
export interface ComponentProps extends BaseProps {
  [key: string]: unknown;
}

/**
 * Component definition with improved type safety
 * 
 * 型变性说明（注释形式，因TypeScript限制无法使用显式型变标记）：
 * - T（状态类型）约束为 object，确保状态是对象类型以支持类型安全的状态管理
 *   理论上是协变的（covariant）- 组件产生状态供外部读取
 *   但由于 model 函数同时读写状态，实际上是不变的（invariant）
 * - P（props类型）理论上是逆变的（contravariant）- 组件接受外部传入的props
 *   但由于 props 字段和其他方法的复杂交互，实际上也是不变的（invariant）
 * - 在实践中，两个类型参数都应视为不变的（invariant）
 */
export interface ComponentDefinition<T extends object = Record<string, unknown>, P extends ComponentProps = ComponentProps> {
  /** Component display name for debugging */
  displayName?: string;

  /** Initial state - must be a record/object type */
  initialState: T;

  /** Default props for the component */
  props?: Partial<P>;

  /** Intent function for handling user interactions */
  intent?: Intent<unknown>;

  /** Model function for state updates */
  model?: Model<T, unknown>;

  /** View function - required */
  view: View<T>;

  /** Mixins to apply to the component */
  mixins?: Record<string, Mixin<T>>;

  /** Lifecycle methods */
  lifecycle?: MixinLifecycle<T>;
  
  /** 组件依赖的contexts（可选，用于声明式context依赖） */
  contexts?: Array<any>; // 使用any避免循环引用，实际类型是Context<any>[]
}

/**
 * Component instance with improved type safety
 * 
 * 型变性说明：
 * - T（状态类型）约束为 object，是不变的（invariant）- 实例既读取又修改状态
 * - P（props类型）是不变的（invariant）- 实例既读取props又可能更新props
 */
export interface ComponentInstance<T extends object = Record<string, unknown>, P extends ComponentProps = ComponentProps> {
  /** Component definition */
  readonly definition: ComponentDefinition<T, P>;

  /** Current state */
  state: T;

  /** Props */
  props: P;

  /** Dispatch function for state updates */
  dispatch: Dispatch<unknown>;

  /** Render function that returns virtual DOM */
  render: () => VNode;

  /** Update component props and trigger re-render */
  updateProps: (newProps: Partial<P>) => void;

  /** Destroy component and clean up resources */
  destroy: () => void;

  /** Get mixed state (including mixin states) */
  getMixedState: () => MixedState<T, NonNullable<ComponentDefinition<T, P>['mixins']>>;
  
  /** Context订阅清理函数列表 */
  contextUnsubscribers?: Array<() => void>;
  
  /** 强制重新渲染（用于context更新） */
  forceUpdate?: () => void;
}

/**
 * Component factory function type
 */
export type ComponentFactory<T extends object = Record<string, unknown>, P extends ComponentProps = ComponentProps> = (
  props?: P
) => ComponentInstance<T, P>;

/**
 * Component registry interface for managing named components
 */
export interface ComponentRegistryInterface {
  register<T extends object, P extends ComponentProps>(
    name: string,
    factory: ComponentFactory<T, P>
  ): void;

  get<T extends object, P extends ComponentProps>(name: string): ComponentFactory<T, P> | undefined;

  has(name: string): boolean;

  unregister(name: string): boolean;

  getNames(): string[];

  clear(): void;
}

/**
 * Render function that can be used in JSX-like syntax
 */
export type RenderFunction = (component: ComponentInstance) => VNode;

/**
 * Component context for nested rendering
 */
export interface ComponentContext {
  parent?: ComponentInstance;
  depth: number;
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps extends ComponentProps {
  fallback?: (error: Error) => VNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: { componentStack: string };
}

/**
 * Component error type
 */
export interface ComponentError {
  message: string;
  stack?: string;
  component?: string;
  timestamp: number;
  cause?: Error;
}

/**
 * Error boundary handler
 */
export type ErrorBoundaryHandler = (error: Error, errorInfo: { componentStack: string }) => void;

/**
 * Error recovery strategy
 */
export type ErrorRecoveryStrategy = 'rethrow' | 'fallback' | 'silent' | 'custom';

/**
 * Error context for debugging
 */
export interface ErrorContext {
  component?: string;
  action?: unknown;
  props?: ComponentProps;
  state?: Record<string, unknown>;
  lifecycle?: string;
}

/**
 * Lifecycle hook types for better type safety
 */
export type LifecycleHook<T = unknown> = (state: T, dispatch?: Dispatch<unknown>) => void | Promise<void>;

/**
 * Async component definition for lazy loading
 */
export interface AsyncComponentDefinition<T extends object = Record<string, unknown>, P extends ComponentProps = ComponentProps> {
  loader: () => Promise<ComponentDefinition<T, P>>;
  loading?: ComponentDefinition<{ isLoading: boolean }, ComponentProps>;
  error?: ComponentDefinition<{ error: Error }, ComponentProps>;
}
