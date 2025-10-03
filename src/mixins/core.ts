import type { Mixin, AppliedMixins, MixinLifecycle, MixinReducer, MixedState, Method } from './types';
import type { Dispatch } from '../mvi/types';
import type { VNode } from '../vdom/types';

/**
 * Apply mixins to a base state
 * Merges mixin initial states, lifecycle methods, computed properties, methods, and handlers
 * 
 * @param baseState - The base state object
 * @param mixins - Record of named mixins to apply
 * @returns Applied mixins with merged functionality
 */
export function applyMixins<T, M extends Record<string, Mixin<any>>>(
  baseState: T,
  mixins: M
): AppliedMixins<T, M> {
  // Initialize result structure
  const result: AppliedMixins<T, M> = {
    initialState: { ...baseState } as MixedState<T, M>,
    lifecycle: {},
    computed: {},
    methods: {},
    handlers: {}
  };

  // If no mixins, return base state
  if (!mixins || Object.keys(mixins).length === 0) {
    return result;
  }

  // Merge initial states - each mixin gets its own namespace
  Object.entries(mixins).forEach(([key, mixin]) => {
    if (mixin.initialState !== undefined) {
      (result.initialState as any)[key] = mixin.initialState;
    }
  });

  // Collect all lifecycle methods
  const lifecycleHooks: {
    created: Array<(state: any, dispatch?: Dispatch<any>) => void | Promise<void>>;
    beforeRender: Array<(state: any, dispatch?: Dispatch<any>) => void | Promise<void>>;
    afterRender: Array<(state: any, vnode: VNode) => void | Promise<void>>;
    destroyed: Array<(state: any, dispatch?: Dispatch<any>) => void | Promise<void>>;
  } = {
    created: [],
    beforeRender: [],
    afterRender: [],
    destroyed: []
  };

  Object.values(mixins).forEach(mixin => {
    if (mixin.lifecycle?.created) {
      lifecycleHooks.created.push(mixin.lifecycle.created);
    }
    if (mixin.lifecycle?.beforeRender) {
      lifecycleHooks.beforeRender.push(mixin.lifecycle.beforeRender);
    }
    if (mixin.lifecycle?.afterRender) {
      lifecycleHooks.afterRender.push(mixin.lifecycle.afterRender);
    }
    if (mixin.lifecycle?.destroyed) {
      lifecycleHooks.destroyed.push(mixin.lifecycle.destroyed);
    }
  });

  // Create combined lifecycle methods with error isolation
  result.lifecycle.created = (state, dispatch) => {
    lifecycleHooks.created.forEach(hook => {
      try {
        hook(state, dispatch);
      } catch (error) {
        console.error('[Marabutan] Mixin lifecycle error (created):', error);
        // Continue executing other mixins
      }
    });
  };

  result.lifecycle.beforeRender = (state, dispatch) => {
    lifecycleHooks.beforeRender.forEach(hook => {
      try {
        hook(state, dispatch);
      } catch (error) {
        console.error('[Marabutan] Mixin lifecycle error (beforeRender):', error);
        // Continue executing other mixins
      }
    });
  };

  result.lifecycle.afterRender = (state, vnode) => {
    lifecycleHooks.afterRender.forEach(hook => {
      try {
        hook(state, vnode);
      } catch (error) {
        console.error('[Marabutan] Mixin lifecycle error (afterRender):', error);
        // Continue executing other mixins
      }
    });
  };

  result.lifecycle.destroyed = (state, dispatch) => {
    lifecycleHooks.destroyed.forEach(hook => {
      try {
        hook(state, dispatch);
      } catch (error) {
        console.error('[Marabutan] Mixin lifecycle error (destroyed):', error);
        // Continue executing other mixins
      }
    });
  };

  // Merge computed properties, methods, and handlers
  Object.values(mixins).forEach(mixin => {
    if (mixin.computed) {
      Object.assign(result.computed, mixin.computed);
    }
    if (mixin.methods) {
      Object.assign(result.methods, mixin.methods);
    }
    if (mixin.handlers) {
      Object.assign(result.handlers, mixin.handlers);
    }
  });

  return result;
}

/**
 * Execute a lifecycle hook if it exists
 * 
 * @param lifecycle - Lifecycle object containing hooks
 * @param hook - Hook name to execute
 * @param state - Current state
 * @param dispatch - Dispatch function (optional)
 * @param vnode - VNode (for afterRender hook)
 */
export function executeLifecycle<T = any>(
  lifecycle: MixinLifecycle<any> | undefined,
  hook: keyof MixinLifecycle<any>,
  state: T,
  dispatch?: Dispatch<any>,
  vnode?: VNode
): void {
  if (!lifecycle || !lifecycle[hook]) {
    return;
  }

  const hookFn = lifecycle[hook];
  if (!hookFn) {
    return;
  }

  if (hook === 'afterRender' && vnode) {
    (hookFn as any)(state, vnode);
  } else {
    (hookFn as any)(state, dispatch);
  }
}

/**
 * Create a mixin from a definition
 * This is essentially a pass-through function for type safety and clarity
 * 
 * @param definition - Mixin definition
 * @returns The mixin
 */
export function createMixin<T = any>(definition: Mixin<T>): Mixin<T> {
  return definition;
}

/**
 * Create a stateful mixin with a reducer
 * 
 * @param initialState - Initial state for the mixin
 * @param reducer - Optional reducer function
 * @returns A mixin with state management
 */
export function createStatefulMixin<T = any, A = any>(
  initialState: T,
  reducer?: MixinReducer<T, A>
): Mixin<T> {
  const mixin: Mixin<T> = {
    initialState,
    reducer,
    methods: {}
  };

  // If a reducer is provided, add a reduce method
  if (reducer) {
    mixin.methods = {
      reduce: ((state: T, action: A) => reducer(state, action)) as Method<T>
    };
  }

  return mixin;
}

