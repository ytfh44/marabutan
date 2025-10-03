import type { VNode } from '../vdom/types';
import type { Dispatch } from '../mvi/types';

/**
 * Lifecycle hook function type
 * 逆变（contravariant）在 state 参数 - 可以接受更泛化的状态类型
 */
export type LifecycleHook<T = any> = (
  state: T,
  dispatch?: Dispatch<unknown>,
  vnode?: VNode
) => void | Promise<void>;

/**
 * Mixin lifecycle methods
 * All lifecycle hooks are optional
 * 不变（invariant）- 包含多个方法的对象
 */
export interface MixinLifecycle<T = any> {
  /** Called when component is created */
  created?: LifecycleHook<T>;
  
  /** Called before rendering */
  beforeRender?: LifecycleHook<T>;
  
  /** Called after rendering */
  afterRender?: (state: T, vnode: VNode) => void | Promise<void>;
  
  /** Called when component is destroyed */
  destroyed?: LifecycleHook<T>;
}

/**
 * Computed property function type
 * 逆变（contravariant）在参数 state，协变（covariant）在返回值
 */
export type ComputedProperty<T = any, R = unknown> = (state: T) => R;

/**
 * Method function type with variadic args support
 * 逆变（contravariant）在参数，协变（covariant）在返回值
 */
export type Method<T = any, Args extends unknown[] = unknown[], R = unknown> = (
  state: T,
  ...args: Args
) => R;

/**
 * Event handler function type with variadic args
 * 逆变（contravariant）在参数，协变（covariant）在返回值
 */
export type EventHandler<Args extends unknown[] = unknown[], R = void> = (
  ...args: Args
) => R;

/**
 * Reducer function type for stateful mixins
 */
export type MixinReducer<T = any, A = any> = (state: T, action: A) => T;

/**
 * Mixin definition interface
 * Mixins provide reusable component logic
 */
export interface Mixin<T = any> {
  /** Initial state for this mixin */
  initialState?: T;
  
  /** Lifecycle methods */
  lifecycle?: MixinLifecycle<T>;
  
  /** Computed properties */
  computed?: Record<string, ComputedProperty<T>>;
  
  /** Methods */
  methods?: Record<string, Method<T>>;
  
  /** Event handlers */
  handlers?: Record<string, EventHandler>;
  
  /** State reducer for this mixin */
  reducer?: MixinReducer<T>;
}

/**
 * Applied mixins result
 * Contains merged mixin state and functionality
 */
export interface AppliedMixins<T = any, M extends Record<string, Mixin<any>> = {}> {
  /** Initial state with mixin states merged */
  initialState: MixedState<T, M>;
  
  /** Combined lifecycle methods */
  lifecycle: MixinLifecycle<MixedState<T, M>>;
  
  /** All computed properties from mixins */
  computed: Record<string, ComputedProperty<any>>;
  
  /** All methods from mixins */
  methods: Record<string, Method<any>>;
  
  /** All event handlers from mixins */
  handlers: Record<string, EventHandler>;
}

/**
 * Mixed state type - combines base state with mixin states
 * Each mixin's state is namespaced under its key
 */
export type MixedState<T, M extends Record<string, Mixin<any>>> = T & {
  [K in keyof M]: M[K] extends Mixin<infer S> ? S : never;
};

/**
 * Stateful mixin options
 */
export interface StatefulMixinOptions<T = any, A = any> {
  initialState: T;
  reducer?: MixinReducer<T, A>;
  lifecycle?: MixinLifecycle<T>;
  computed?: Record<string, ComputedProperty<T>>;
  methods?: Record<string, Method<T>>;
}

