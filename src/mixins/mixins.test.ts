import { describe, it, expect, vi } from 'vitest';
import {
  applyMixins,
  executeLifecycle,
  createMixin,
  createStatefulMixin
} from './core';
import type { Mixin } from './types';

describe('Mixins System', () => {
  describe('applyMixins', () => {
    it('should merge initial states from mixins', () => {
      const baseState = { base: 'value' };
      const mixins = {
        mixin1: createMixin({
          initialState: { mixin1Value: 1 }
        }),
        mixin2: createMixin({
          initialState: { mixin2Value: 2 }
        })
      };

      const result = applyMixins(baseState, mixins);

      expect(result.initialState).toEqual({
        base: 'value',
        mixin1: { mixin1Value: 1 },
        mixin2: { mixin2Value: 2 }
      });
    });

    it('should create combined lifecycle methods', () => {
      const created1 = vi.fn().mockImplementation(() => {});
      const created2 = vi.fn().mockImplementation(() => {});

      const mixins = {
        mixin1: createMixin({
          lifecycle: { created: created1 }
        }),
        mixin2: createMixin({
          lifecycle: { created: created2 }
        })
      };

      const result = applyMixins({}, mixins);

      const mockDispatch = vi.fn();
      const state = {};

      executeLifecycle(result.lifecycle, 'created', state, mockDispatch);

      expect(created1).toHaveBeenCalledWith(state, mockDispatch);
      expect(created2).toHaveBeenCalledWith(state, mockDispatch);
    });

    it('should collect computed properties', () => {
      const mixins = {
        mixin1: createMixin({
          computed: {
            computed1: (state) => state.value * 2
          }
        }),
        mixin2: createMixin({
          computed: {
            computed2: (state) => state.value + 10
          }
        })
      };

      const result = applyMixins({}, mixins);

      expect(result.computed).toHaveProperty('computed1');
      expect(result.computed).toHaveProperty('computed2');
    });

    it('should collect methods', () => {
      const method1 = vi.fn();
      const method2 = vi.fn();

      const mixins = {
        mixin1: createMixin({
          methods: { method1 }
        }),
        mixin2: createMixin({
          methods: { method2 }
        })
      };

      const result = applyMixins({}, mixins);

      expect(result.methods).toHaveProperty('method1', method1);
      expect(result.methods).toHaveProperty('method2', method2);
    });

    it('should collect event handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const mixins = {
        mixin1: createMixin({
          handlers: { onClick: handler1 }
        }),
        mixin2: createMixin({
          handlers: { onInput: handler2 }
        })
      };

      const result = applyMixins({}, mixins);

      expect(result.handlers).toHaveProperty('onClick', handler1);
      expect(result.handlers).toHaveProperty('onInput', handler2);
    });

    it('should handle mixin conflicts by overriding', () => {
      const mixins = {
        mixin1: createMixin({
          initialState: { value: 1 },
          methods: { getValue: () => 1 }
        }),
        mixin2: createMixin({
          initialState: { value: 2 },
          methods: { getValue: () => 2 }
        })
      };

      const result = applyMixins({ base: 'test' }, mixins);

      // Mixins are stored separately, not merged
      expect(result.initialState.mixin1.value).toBe(1);
      expect(result.initialState.mixin2.value).toBe(2);
      expect(result.methods.getValue()).toBe(2); // Later mixin overrides
    });

    it('should execute lifecycle methods in correct order', () => {
      const executionOrder: string[] = [];
      const created1 = vi.fn().mockImplementation(() => executionOrder.push('mixin1-created'));
      const created2 = vi.fn().mockImplementation(() => executionOrder.push('mixin2-created'));
      const beforeRender1 = vi.fn().mockImplementation(() => executionOrder.push('mixin1-beforeRender'));
      const beforeRender2 = vi.fn().mockImplementation(() => executionOrder.push('mixin2-beforeRender'));

      const mixins = {
        mixin1: createMixin({
          lifecycle: { created: created1, beforeRender: beforeRender1 }
        }),
        mixin2: createMixin({
          lifecycle: { created: created2, beforeRender: beforeRender2 }
        })
      };

      const result = applyMixins({}, mixins);

      const mockDispatch = vi.fn();
      const state = {};

      // Execute created lifecycle
      executeLifecycle(result.lifecycle, 'created', state, mockDispatch);

      // Execute beforeRender lifecycle
      executeLifecycle(result.lifecycle, 'beforeRender', state, mockDispatch);

      expect(executionOrder).toEqual([
        'mixin1-created',
        'mixin2-created',
        'mixin1-beforeRender',
        'mixin2-beforeRender'
      ]);
    });

    it('should merge complex state structures', () => {
      const mixins = {
        mixin1: createMixin({
          initialState: {
            user: { name: 'John', preferences: { theme: 'dark' } }
          }
        }),
        mixin2: createMixin({
          initialState: {
            user: { preferences: { language: 'en' } },
            settings: { notifications: true }
          }
        })
      };

      const result = applyMixins({ app: 'test' }, mixins);

      // Complex state structures are stored in separate mixin objects
      expect(result.initialState).toEqual({
        app: 'test',
        mixin1: {
          user: { name: 'John', preferences: { theme: 'dark' } }
        },
        mixin2: {
          user: { preferences: { language: 'en' } },
          settings: { notifications: true }
        }
      });
    });

    it('should handle empty mixins array', () => {
      const result = applyMixins({ base: 'test' }, {});

      expect(result.initialState).toEqual({ base: 'test' });
      expect(result.methods).toEqual({});
      expect(result.computed).toEqual({});
      expect(result.handlers).toEqual({});
    });
  });

  describe('executeLifecycle', () => {
    it('should execute created lifecycle method', () => {
      const createdFn = vi.fn();
      const lifecycle = { created: createdFn };
      const state = { test: 'value' };
      const dispatch = vi.fn();

      executeLifecycle(lifecycle, 'created', state, dispatch);

      expect(createdFn).toHaveBeenCalledWith(state, dispatch);
    });

    it('should execute beforeRender lifecycle method', () => {
      const beforeRenderFn = vi.fn();
      const lifecycle = { beforeRender: beforeRenderFn };
      const state = { test: 'value' };
      const dispatch = vi.fn();

      executeLifecycle(lifecycle, 'beforeRender', state, dispatch);

      expect(beforeRenderFn).toHaveBeenCalledWith(state, dispatch);
    });

    it('should execute afterRender lifecycle method', () => {
      const afterRenderFn = vi.fn();
      const lifecycle = { afterRender: afterRenderFn };
      const state = { test: 'value' };
      const dispatch = vi.fn();
      const vnode = { type: 'div', props: {}, children: [] };

      executeLifecycle(lifecycle, 'afterRender', state, dispatch, vnode);

      expect(afterRenderFn).toHaveBeenCalledWith(state, vnode);
    });

    it('should execute destroyed lifecycle method', () => {
      const destroyedFn = vi.fn();
      const lifecycle = { destroyed: destroyedFn };
      const state = { test: 'value' };
      const dispatch = vi.fn();

      executeLifecycle(lifecycle, 'destroyed', state, dispatch);

      expect(destroyedFn).toHaveBeenCalledWith(state, dispatch);
    });
  });

  describe('createStatefulMixin', () => {
    it('should create a stateful mixin with reducer', () => {
      const initialState = { count: 0 };
      const reducer = (state: { count: number }, action: any) => {
        if (action.type === 'INCREMENT') {
          return { ...state, count: state.count + 1 };
        }
        return state;
      };

      const mixin = createStatefulMixin(initialState, reducer);

      expect(mixin.initialState).toEqual(initialState);
      expect(mixin.methods).toHaveProperty('reduce');
    });

    it('should create a stateful mixin without reducer', () => {
      const initialState = { data: 'test' };
      const mixin = createStatefulMixin(initialState);

      expect(mixin.initialState).toEqual(initialState);
      expect(mixin.methods).toEqual({});
    });
  });

  describe('createMixin', () => {
    it('should create a basic mixin', () => {
      const mixinDefinition = {
        initialState: { test: 'value' },
        lifecycle: {
          created: vi.fn()
        }
      };

      const mixin = createMixin(mixinDefinition);

      expect(mixin).toEqual(mixinDefinition);
    });
  });
});
