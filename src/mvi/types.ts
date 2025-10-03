import type { VNode } from '../vdom/types';

/**
 * Intent function type - handles user interactions and returns actions
 * 逆变（contravariant）在 dispatch 参数
 */
export type Intent<T = unknown> = (dispatch: Dispatch<T>) => void | (() => void);

/**
 * Model function type - updates state based on actions
 * 
 * 型变性说明：
 * - T（状态类型）应该是对象类型以确保类型安全
 * - 返回值必须与输入状态类型一致（不变 invariant）
 * - A（action类型）是逆变的（contravariant）
 */
export type Model<T extends object, A> = (state: T, action: A) => T;

/**
 * View function type - renders state to virtual DOM
 * Can optionally receive dispatch function for event handlers
 * 
 * 型变性说明：
 * - T 是逆变的（contravariant）- 接受状态作为输入
 * - VNode 是返回类型（协变 covariant）
 */
export type View<T> = (state: T, dispatch?: Dispatch<unknown>) => VNode;

/**
 * MVI Application interface with improved type constraints
 * 
 * 型变性说明：
 * - T 约束为 object 类型，确保状态是对象
 * - A 是 action 类型，可以是任意类型
 */
export interface MVIApp<T extends object = Record<string, unknown>, A = unknown> {
  initialState: T;
  intent: Intent<A>;
  model: Model<T, A>;
  view: View<T>;
  rootElement: Element | string;
}

/**
 * Action dispatcher type
 * 
 * 型变性说明：
 * - A 是逆变的（contravariant in）- 接受 action 作为输入参数
 * - 如果 DogAction extends AnimalAction，则 Dispatch<AnimalAction> 
 *   可以赋值给 Dispatch<DogAction>
 */
export type Dispatch<in A> = (action: A) => void;

/**
 * Subscription function type for side effects
 */
export type Subscription<T, A> = (
  state: T,
  dispatch: Dispatch<A>
) => (() => void) | void | Promise<(() => void) | void>;

/**
 * Enhanced MVI Application with subscriptions
 */
export interface MVIPApp<T extends object = Record<string, unknown>, A = unknown> extends MVIApp<T, A> {
  subscriptions?: Subscription<T, A>;
}

/**
 * MVI Control interface returned by run function
 */
export interface MVIControl<T, A> {
  dispatch: Dispatch<A>;
  getState: () => T;
  stop: () => void;
  rerender: () => void;
  subscribe: (callback: (state: T) => void) => () => void;
}
