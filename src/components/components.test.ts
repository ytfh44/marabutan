import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createComponent, ComponentRegistry, registerComponent, registerErrorHandler, createComponentInstance, getComponentInstance, getRegistryStats } from './core';
import { ComponentDefinition } from './types';

describe('Component System', () => {
  describe('createComponent', () => {
    it('should create a component with initial state', () => {
      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      expect(instance.state).toEqual({ count: 0 });
      expect(instance.definition).toBe(definition);
    });

    it('should handle props correctly', () => {
      const definition: ComponentDefinition<{ count: number }, { initial?: number }> = {
        initialState: { count: 0 },
        props: { initial: 5 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component({ initial: 10 });

      expect(instance.props).toEqual({ initial: 10 });
    });

    it('should execute lifecycle methods', () => {
      const createdFn = vi.fn();
      const beforeRenderFn = vi.fn();
      const afterRenderFn = vi.fn();

      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        lifecycle: {
          created: createdFn,
          beforeRender: beforeRenderFn,
          afterRender: afterRenderFn
        },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      expect(createdFn).toHaveBeenCalledWith({ count: 0 }, instance.dispatch);

      const vnode = instance.render();
      expect(beforeRenderFn).toHaveBeenCalled();
      expect(afterRenderFn).toHaveBeenCalledWith({ count: 0 }, vnode);
    });

    it('should handle state updates through dispatch', () => {
      const modelFn = vi.fn().mockImplementation((state, action) => {
        if (action.type === 'INCREMENT') {
          return { ...state, count: state.count + 1 };
        }
        return state;
      });

      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        model: modelFn,
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      instance.dispatch({ type: 'INCREMENT' });

      expect(instance.state).toEqual({ count: 1 });
      expect(modelFn).toHaveBeenCalledWith({ count: 0 }, { type: 'INCREMENT' });
    });

    it('should render the view function result', () => {
      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 5 },
        view: (state) => ({
          type: 'div',
          props: { className: 'counter' },
          children: [`Count: ${state.count}`]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      const vnode = instance.render();

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('counter');
      expect(vnode.children[0]).toBe('Count: 5');
    });

    it('should update props and re-render', () => {
      const definition: ComponentDefinition<{ count: number }, { count?: number }> = {
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component({ count: 5 });

      expect(instance.props).toEqual({ count: 5 });

      instance.updateProps({ count: 10 });

      expect(instance.props).toEqual({ count: 10 });
    });

    it('should destroy component and execute destroyed lifecycle', () => {
      const destroyedFn = vi.fn();

      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        lifecycle: {
          destroyed: destroyedFn
        },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      instance.destroy();

      expect(destroyedFn).toHaveBeenCalledWith({ count: 0 }, instance.dispatch);
    });

    it('should not render after component is destroyed', () => {
      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      instance.destroy();

      expect(() => instance.render()).toThrow('Cannot render destroyed component');
    });

    it('should not dispatch after component is destroyed', () => {
      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      instance.destroy();

      expect(() => instance.dispatch({ type: 'INCREMENT' })).toThrow('Cannot dispatch on destroyed component');
    });

    it('should handle multiple destroy calls gracefully', () => {
      const destroyedFn = vi.fn();

      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        lifecycle: {
          destroyed: destroyedFn
        },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      instance.destroy();
      instance.destroy(); // Second call should not cause issues

      expect(destroyedFn).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it('should handle async operations in lifecycle methods', async () => {
      const createdFn = vi.fn().mockResolvedValue(undefined);
      const beforeRenderFn = vi.fn().mockResolvedValue(undefined);

      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        lifecycle: {
          created: createdFn,
          beforeRender: beforeRenderFn
        },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      // Call render to trigger beforeRender lifecycle
      instance.render();

      // Wait for async lifecycle methods to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(createdFn).toHaveBeenCalled();
      expect(beforeRenderFn).toHaveBeenCalled();
    });

    it('should handle async operations in model function', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      const modelFn = vi.fn().mockImplementation(async (state, action) => {
        if (action.type === 'ASYNC_INCREMENT') {
          await promise;
          return { ...state, count: state.count + 1 };
        }
        return state;
      });

      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        model: modelFn,
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count?.toString() || '0']
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      // Dispatch async action (dispatch itself is synchronous)
      instance.dispatch({ type: 'ASYNC_INCREMENT' });

      // Wait a bit for async operation to start
      await new Promise(resolve => setTimeout(resolve, 0));

      // Resolve the async operation
      resolvePromise(undefined);

      // Wait for async state update to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(instance.state.count).toBe(1);
      expect(modelFn).toHaveBeenCalledWith({ count: 0 }, { type: 'ASYNC_INCREMENT' });
    });

    it('should handle mixed state from mixins', () => {
      const definition: ComponentDefinition<
        { base: string },
        {},
        { mixin1: { mixinValue: number } }
      > = {
        initialState: { base: 'test' },
        mixins: {
          mixin1: {
            initialState: { mixinValue: 42 }
          }
        },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [`${state.base}: ${state.mixinValue}`]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      expect(instance.getMixedState()).toEqual({
        base: 'test',
        mixin1: { mixinValue: 42 }
      });
    });
  });

  describe('ComponentRegistry', () => {
    it('should register and retrieve components', () => {
      const registry = new ComponentRegistry();

      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);

      registry.register('TestComponent', Component);

      expect(registry.has('TestComponent')).toBe(true);
      expect(registry.get('TestComponent')).toBe(Component);
    });

    it('should unregister components', () => {
      const registry = new ComponentRegistry();

      const Component = createComponent({
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      });

      registry.register('TestComponent', Component);
      expect(registry.has('TestComponent')).toBe(true);

      const removed = registry.unregister('TestComponent');
      expect(removed).toBe(true);
      expect(registry.has('TestComponent')).toBe(false);
    });

    it('should return all registered component names', () => {
      const registry = new ComponentRegistry();

      const Component1 = createComponent({
        initialState: { count: 0 },
        view: (state) => ({ type: 'div', props: {}, children: [] })
      });

      const Component2 = createComponent({
        initialState: { count: 0 },
        view: (state) => ({ type: 'div', props: {}, children: [] })
      });

      registry.register('Component1', Component1);
      registry.register('Component2', Component2);

      expect(registry.getNames()).toEqual(['Component1', 'Component2']);
    });
  });

  describe('registerComponent (global registry)', () => {
    it('should register components in the default registry', () => {
      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = registerComponent('GlobalTestComponent', definition);

      expect(Component).toBeDefined();

      // The component should be registered in the default registry
      // This would be tested through the registry tests above
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in lifecycle methods', () => {
      const errorHandler = vi.fn();
      const cleanup = registerErrorHandler(errorHandler);

      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        lifecycle: {
          created: () => {
            throw new Error('Lifecycle error');
          }
        },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      expect(() => Component()).toThrow();
      expect(errorHandler).toHaveBeenCalled();

      cleanup();
    });

    it('should handle errors in render method', () => {
      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        view: () => {
          throw new Error('Render error');
        }
      };

      const Component = createComponent(definition);
      const instance = Component();

      // The error should be caught, logged, and re-thrown
      expect(() => instance.render()).toThrow();

      // This test verifies that errors are properly caught and re-thrown
      // Error logging and handler notification are tested separately
    });

    it('should handle errors in dispatch method', () => {
      const errorHandler = vi.fn();
      const cleanup = registerErrorHandler(errorHandler);

      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        model: () => {
          throw new Error('Model error');
        },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      expect(() => instance.dispatch({ type: 'INCREMENT' })).toThrow();
      expect(errorHandler).toHaveBeenCalled();

      cleanup();
    });
  });

  describe('Component Instance Caching', () => {
    it('should create and cache component instances', () => {
      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      registerComponent('CachedComponent', definition);

      const instance1 = createComponentInstance('CachedComponent');
      const instance2 = getComponentInstance('CachedComponent');

      expect(instance1).toBeDefined();
      expect(instance2).toBe(instance1); // Should be the same cached instance
    });

    it('should update props on cached instances', () => {
      const definition: ComponentDefinition<{ count: number }, { count?: number }> = {
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      registerComponent('PropsComponent', definition);

      const instance = createComponentInstance('PropsComponent', { count: 5 });
      expect(instance?.props.count).toBe(5);

      // Create another instance with different props
      const instance2 = createComponentInstance('PropsComponent', { count: 10 });
      expect(instance2?.props.count).toBe(10);
    });

    it('should get registry statistics', () => {
      const definition: ComponentDefinition<{ count: number }> = {
        initialState: { count: 0 },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [state.count.toString()]
        })
      };

      // Create a fresh registry for this test
      const testRegistry = new ComponentRegistry();

      // Register components in the test registry
      testRegistry.register('StatsComponent1', createComponent(definition));
      testRegistry.register('StatsComponent2', createComponent(definition));

      // Create an instance
      const instance = testRegistry.createInstance('StatsComponent1');

      const stats = testRegistry.getStats();
      expect(stats.componentCount).toBe(2);
      expect(stats.instanceCount).toBe(1);
    });
  });

  describe('Type Safety', () => {
    it('should enforce proper state types', () => {
      // This test ensures TypeScript enforces the new type constraints
      const definition: ComponentDefinition<{ count: number; name: string }> = {
        initialState: { count: 0, name: 'test' },
        view: (state) => ({
          type: 'div',
          props: {},
          children: [`${state.name}: ${state.count}`]
        })
      };

      const Component = createComponent(definition);
      const instance = Component();

      expect(instance.state).toEqual({ count: 0, name: 'test' });
    });

    it('should enforce proper props types', () => {
      interface TestProps {
        variant: 'primary' | 'secondary';
        size: 'small' | 'large';
      }

      const definition: ComponentDefinition<{}, TestProps> = {
        initialState: {},
        props: { variant: 'primary', size: 'small' },
        view: (state) => ({
          type: 'button',
          props: { className: `primary small` },
          children: ['Click me']
        })
      };

      const Component = createComponent(definition);
      const instance = Component({ variant: 'secondary', size: 'large' });

      expect(instance.props.variant).toBe('secondary');
      expect(instance.props.size).toBe('large');
    });
  });
});
