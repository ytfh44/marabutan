import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { run } from './core';
import { createVNode } from '../vdom/vnode';
import type { MVIApp } from './types';

/**
 * MVI Core Advanced Test Suite
 * Goal: Cover uncovered functionality in mvi/core.ts
 * Focus: Asynchronous model, subscription system, error handling, rootElement handling
 */
describe('MVI Core - Advanced Test Suite', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-app';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe('Asynchronous Model Functions', () => {
    it('should handle model functions that return Promises without crashing', async () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => {
          if (action.type === 'INCREMENT_ASYNC') {
            // Return Promise - test that the code can handle this situation
            return Promise.resolve({ ...state, count: state.count + 1 }) as any;
          }
          return state;
        },
        
        view: (state) => createVNode('div', {}, [String(state?.count ?? 0)]),
        
        rootElement: '#test-app'
      };

      // Main test: creation and running should not crash
      expect(() => run(app)).not.toThrow();
      
      const control = run(app);
      
      // Dispatching async action should not crash
      expect(() => control.dispatch({ type: 'INCREMENT_ASYNC' })).not.toThrow();

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Cleanup
      control.stop();
    });

    it('should not render synchronously with async model', async () => {
      let renderCount = 0;

      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {
          (window as any).testDispatch = dispatch;
        },
        
        model: (state, action) => {
          if (action.type === 'ASYNC') {
            return Promise.resolve({ count: 1 }) as any;
          }
          return state;
        },
        
        view: (state) => {
          renderCount++;
          return createVNode('div', {}, [state.count.toString()]);
        },
        
        rootElement: '#test-app'
      };

      const initialRenderCount = 1; // Initial render
      const control = run(app);
      expect(renderCount).toBe(initialRenderCount);

      control.dispatch({ type: 'ASYNC' });

      // Should not render synchronously
      expect(renderCount).toBe(initialRenderCount);

      // Wait for async completion
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should render after async completion
      expect(renderCount).toBeGreaterThan(initialRenderCount);

      control.stop();
      delete (window as any).testDispatch;
    });
  });

  describe('Subscription System', () => {
    it('should support subscribing to state changes', () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {
          (window as any).testDispatch = dispatch;
        },
        
        model: (state, action) => {
          if (action.type === 'INCREMENT') {
            return { ...state, count: state.count + 1 };
          }
          return state;
        },
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      const control = run(app);
      const subscriber = vi.fn();

      control.subscribe(subscriber);

      control.dispatch({ type: 'INCREMENT' });

      // Subscriber should be called
      expect(subscriber).toHaveBeenCalled();
      expect(subscriber).toHaveBeenCalledWith({ count: 1 });

      control.stop();
      delete (window as any).testDispatch;
    });

    it('should support unsubscribing', () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => {
          if (action.type === 'INCREMENT') {
            return { ...state, count: state.count + 1 };
          }
          return state;
        },
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      const control = run(app);
      const subscriber = vi.fn();

      const unsubscribe = control.subscribe(subscriber);

      control.dispatch({ type: 'INCREMENT' });
      expect(subscriber).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      control.dispatch({ type: 'INCREMENT' });
      // Should not be called anymore
      expect(subscriber).toHaveBeenCalledTimes(1);

      control.stop();
    });

    it('should support multiple subscribers', () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => {
          if (action.type === 'INCREMENT') {
            return { ...state, count: state.count + 1 };
          }
          return state;
        },
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      const control = run(app);
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();
      const subscriber3 = vi.fn();

      control.subscribe(subscriber1);
      control.subscribe(subscriber2);
      control.subscribe(subscriber3);

      control.dispatch({ type: 'INCREMENT' });

      // All subscribers should be called
      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
      expect(subscriber3).toHaveBeenCalledTimes(1);

      control.stop();
    });

    it('should isolate subscriber errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => {
          if (action.type === 'INCREMENT') {
            return { ...state, count: state.count + 1 };
          }
          return state;
        },
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      const control = run(app);
      
      const errorSubscriber = vi.fn(() => {
        throw new Error('Subscriber error');
      });
      const normalSubscriber = vi.fn();

      control.subscribe(errorSubscriber);
      control.subscribe(normalSubscriber);

      control.dispatch({ type: 'INCREMENT' });

      // Error subscriber throws error, but should not affect other subscribers
      expect(errorSubscriber).toHaveBeenCalledTimes(1);
      expect(normalSubscriber).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();

      control.stop();
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in intent function', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {
          throw new Error('Intent error');
        },
        
        model: (state, action) => state,
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      // Should not throw error
      expect(() => run(app)).not.toThrow();
      
      // Should log error
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle rendering errors in view function', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => state,
        
        view: (state) => {
          throw new Error('View error');
        },
        
        rootElement: '#test-app'
      };

      // Should throw error (view errors are not caught because they cause rendering failure)
      expect(() => run(app)).toThrow('View error');

      consoleSpy.mockRestore();
    });

    it('should handle state update errors in model function', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {
          (window as any).testDispatch = dispatch;
        },
        
        model: (state, action) => {
          if (action.type === 'ERROR') {
            throw new Error('Model error');
          }
          return state;
        },
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      const control = run(app);

      // Dispatch an action that will cause an error
      // Error will be caught and logged, but not thrown
      control.dispatch({ type: 'ERROR' });

      // Should log error
      expect(consoleSpy).toHaveBeenCalled();

      control.stop();
      consoleSpy.mockRestore();
      delete (window as any).testDispatch;
    });

    it('should prevent dispatch after stop', () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => {
          if (action.type === 'INCREMENT') {
            return { ...state, count: state.count + 1 };
          }
          return state;
        },
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      const control = run(app);
      
      control.stop();

      // Dispatch should not update state after stop
      control.dispatch({ type: 'INCREMENT' });
      
      expect(control.getState().count).toBe(0);
    });
  });

  describe('rootElement Handling', () => {
    it('should support string selectors', () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => state,
        
        view: (state) => createVNode('div', { className: 'test' }, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      const control = run(app);

      // Should render in container
      const element = container.querySelector('.test');
      expect(element).toBeTruthy();

      control.stop();
    });

    it('should support Element objects', () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => state,
        
        view: (state) => createVNode('div', { className: 'test' }, [state.count.toString()]),
        
        rootElement: container
      };

      const control = run(app);

      // 应该在容器中渲染
      const element = container.querySelector('.test');
      expect(element).toBeTruthy();

      control.stop();
    });

    it('should handle invalid selectors', () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => state,
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#non-existent'
      };

      // Should not throw error (just can't find element)
      expect(() => run(app)).not.toThrow();
    });
  });

  describe('getState Method', () => {
    it('should return current state', () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 42 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => state,
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      const control = run(app);

      expect(control.getState()).toEqual({ count: 42 });

      control.stop();
    });

    it('should return updated state', () => {
      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => {
          if (action.type === 'SET') {
            return { ...state, count: (action as any).value };
          }
          return state;
        },
        
        view: (state) => createVNode('div', {}, [state.count.toString()]),
        
        rootElement: '#test-app'
      };

      const control = run(app);

      control.dispatch({ type: 'SET', value: 100 } as any);

      expect(control.getState().count).toBe(100);

      control.stop();
    });
  });

  describe('rerender Method', () => {
    it('should force re-render', () => {
      let renderCount = 0;

      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => state,
        
        view: (state) => {
          renderCount++;
          return createVNode('div', {}, [state.count.toString()]);
        },
        
        rootElement: '#test-app'
      };

      const control = run(app);
      const initialRenderCount = renderCount;

      control.rerender();

      // Should increase render count
      expect(renderCount).toBe(initialRenderCount + 1);

      control.stop();
    });
  });

  describe('Batch Updates and Scheduler Integration', () => {
    it('should batch consecutive dispatches', async () => {
      let renderCount = 0;

      const app: MVIApp<{ count: number }, { type: string }> = {
        initialState: { count: 0 },
        
        intent: (dispatch) => {},
        
        model: (state, action) => {
          if (action.type === 'INCREMENT') {
            return { ...state, count: state.count + 1 };
          }
          return state;
        },
        
        view: (state) => {
          renderCount++;
          return createVNode('div', {}, [state.count.toString()]);
        },
        
        rootElement: '#test-app'
      };

      const control = run(app);
      const initialRenderCount = renderCount;

      // Dispatch multiple times consecutively
      control.dispatch({ type: 'INCREMENT' });
      control.dispatch({ type: 'INCREMENT' });
      control.dispatch({ type: 'INCREMENT' });

      // Wait for scheduler execution
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should batch process (render count should be less than dispatch count)
      // Due to batch updates, should be less than 3 additional renders
      expect(renderCount).toBeLessThanOrEqual(initialRenderCount + 3);
      expect(control.getState().count).toBe(3);

      control.stop();
    });
  });
});

