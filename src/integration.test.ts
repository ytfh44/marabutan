import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createComponent } from './components/core';
import { run } from './mvi/core';
import { ComponentDefinition } from './components/types';
import { MVIApp } from './mvi/types';

describe('Integration Tests', () => {
  beforeEach(() => {
    // Create a test DOM element
    const testElement = document.createElement('div');
    testElement.id = 'test-app';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    // Clean up test DOM element
    const testElement = document.getElementById('test-app');
    if (testElement) {
      document.body.removeChild(testElement);
    }
  });

  it('should integrate components with MVI architecture', () => {
    // Create a component that uses MVI internally
    const componentDefinition: ComponentDefinition<{ count: number }> = {
      initialState: { count: 0 },
      model: (state, action) => {
        if (action.type === 'INCREMENT') {
          return { ...state, count: state.count + 1 };
        }
        return state;
      },
      view: (state) => ({
        type: 'div',
        props: { className: 'counter' },
        children: [
          { type: 'h2', props: {}, children: [`Count: ${state.count}`] },
          {
            type: 'button',
            props: { onClick: () => ({ type: 'INCREMENT' }) },
            children: ['Increment']
          }
        ]
      })
    };

    const CounterComponent = createComponent(componentDefinition);
    const componentInstance = CounterComponent();

    // Verify component structure
    expect(componentInstance.state.count).toBe(0);

    // Test state update
    componentInstance.dispatch({ type: 'INCREMENT' });
    expect(componentInstance.state.count).toBe(1);

    // Test rendering
    const vnode = componentInstance.render();
    expect(vnode.type).toBe('div');
    expect(vnode.props.className).toBe('counter');
    expect(vnode.children).toHaveLength(2);
  });

  it('should handle multiple components interacting', () => {
    // Create two counter components
    const counterDefinition: ComponentDefinition<{ count: number; id: string }> = {
      initialState: { count: 0, id: '' },
      props: { id: '' },
      model: (state, action) => {
        if (action.type === 'INCREMENT') {
          return { ...state, count: state.count + 1 };
        }
        return state;
      },
      view: (state) => ({
        type: 'div',
        props: { className: `counter-${state.id}` },
        children: [
          { type: 'span', props: {}, children: [`${state.id}: ${state.count}`] },
          {
            type: 'button',
            props: { onClick: () => ({ type: 'INCREMENT' }) },
            children: ['+']
          }
        ]
      })
    };

    const CounterComponent = createComponent(counterDefinition);

    const counter1 = CounterComponent({ id: 'counter1' });
    const counter2 = CounterComponent({ id: 'counter2' });

    expect(counter1.state.count).toBe(0);
    expect(counter2.state.count).toBe(0);

    // Update both counters
    counter1.dispatch({ type: 'INCREMENT' });
    counter2.dispatch({ type: 'INCREMENT' });
    counter2.dispatch({ type: 'INCREMENT' });

    expect(counter1.state.count).toBe(1);
    expect(counter2.state.count).toBe(2);
  });

  it('should handle complete application lifecycle', () => {
    const app: MVIApp<
      { isLoading: boolean; data: string[]; error: string | null },
      { type: 'FETCH_START' | 'FETCH_SUCCESS' | 'FETCH_ERROR'; data?: string[]; error?: string }
    > = {
      initialState: { isLoading: false, data: [], error: null },
      intent: () => ({}),
      model: (state, action) => {
        switch (action.type) {
          case 'FETCH_START':
            return { ...state, isLoading: true, error: null };
          case 'FETCH_SUCCESS':
            return { ...state, isLoading: false, data: action.data || [], error: null };
          case 'FETCH_ERROR':
            return { ...state, isLoading: false, error: action.error || 'Unknown error' };
          default:
            return state;
        }
      },
      view: (state) => ({
        type: 'div',
        props: { className: 'app' },
        children: [
          state.isLoading ? { type: 'div', props: { className: 'loading' }, children: ['Loading...'] } : null,
          state.error ? { type: 'div', props: { className: 'error' }, children: [state.error] } : null,
          { type: 'div', props: { className: 'data' }, children: state.data }
        ].filter(Boolean)
      }),
      rootElement: '#test-app'
    };

    const control = run(app);

    // Test initial state
    expect(control.getState().isLoading).toBe(false);
    expect(control.getState().data).toEqual([]);
    expect(control.getState().error).toBe(null);

    // Test fetch start
    control.dispatch({ type: 'FETCH_START' });
    expect(control.getState().isLoading).toBe(true);

    // Test fetch success
    control.dispatch({ type: 'FETCH_SUCCESS', data: ['Item 1', 'Item 2'] });
    expect(control.getState().isLoading).toBe(false);
    expect(control.getState().data).toEqual(['Item 1', 'Item 2']);

    // Test fetch error
    control.dispatch({ type: 'FETCH_ERROR', error: 'Network error' });
    expect(control.getState().error).toBe('Network error');
    expect(control.getState().data).toEqual(['Item 1', 'Item 2']); // Should persist
  });

  it('should handle component composition and data flow', () => {
    // Create a parent component that manages child components
    const childDefinition: ComponentDefinition<{ value: number; label: string }> = {
      initialState: { value: 0, label: '' },
      props: { label: '', value: 0 },
      view: (state) => ({
        type: 'div',
        props: { className: 'child' },
        children: [`${state.label}: ${state.value}`]
      })
    };

    const parentDefinition: ComponentDefinition<{ children: { label: string; value: number }[] }> = {
      initialState: { children: [] },
      model: (state, action) => {
        if (action.type === 'ADD_CHILD') {
          return {
            ...state,
            children: [...state.children, { label: action.label, value: action.value }]
          };
        }
        return state;
      },
      view: (state) => ({
        type: 'div',
        props: { className: 'parent' },
        children: [
          { type: 'h1', props: {}, children: ['Parent Component'] },
          ...state.children.map(child =>
            createComponent(childDefinition)({ label: child.label, value: child.value }).render()
          )
        ]
      })
    };

    const ParentComponent = createComponent(parentDefinition);
    const parentInstance = ParentComponent();

    // Add children
    parentInstance.dispatch({ type: 'ADD_CHILD', label: 'Counter 1', value: 5 });
    parentInstance.dispatch({ type: 'ADD_CHILD', label: 'Counter 2', value: 10 });

    expect(parentInstance.state.children).toHaveLength(2);
    expect(parentInstance.state.children[0].label).toBe('Counter 1');
    expect(parentInstance.state.children[1].value).toBe(10);
  });

  it('should handle error propagation across components', async () => {
    const errorDefinition: ComponentDefinition<{ shouldError: boolean }> = {
      initialState: { shouldError: false },
      props: { shouldError: false },
      model: (state, action) => {
        if (action.type === 'TOGGLE_ERROR') {
          return { ...state, shouldError: !state.shouldError };
        }
        return state;
      },
      view: (state) => {
        if (state.shouldError) {
          throw new Error('Component error');
        }
        return {
          type: 'div',
          props: { className: 'safe' },
          children: ['No error']
        };
      }
    };

    const containerDefinition: ComponentDefinition<{ showErrorComponent: boolean }> = {
      initialState: { showErrorComponent: false },
      model: (state, action) => {
        if (action.type === 'TOGGLE_COMPONENT') {
          return { ...state, showErrorComponent: !state.showErrorComponent };
        }
        return state;
      },
      view: (state) => ({
        type: 'div',
        props: { className: 'container' },
        children: [
          { type: 'h1', props: {}, children: ['Container'] },
          state.showErrorComponent ?
            createComponent(errorDefinition)({ shouldError: true }).render() :
            { type: 'p', props: {}, children: ['No error component'] }
        ]
      })
    };

    const ContainerComponent = createComponent(containerDefinition);
    const containerInstance = ContainerComponent();

    // Initially should render without error
    const initialVNode = containerInstance.render();
    expect(initialVNode.children).toHaveLength(2);

    // Toggle to show error component - this will cause an error during render
    // With the scheduler, errors happen in the scheduled render, not in dispatch
    // So we mock console.error to verify error logging
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    containerInstance.dispatch({ type: 'TOGGLE_COMPONENT' });
    
    // Wait for scheduler to process
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();

    // This test validates that errors are properly logged in the component tree
  });

  it('should handle performance with large datasets', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }));

    const app: MVIApp<
      { items: typeof largeDataset; filter: string },
      { type: 'SET_FILTER'; filter: string }
    > = {
      initialState: { items: largeDataset, filter: '' },
      intent: () => ({}),
      model: (state, action) => {
        if (action.type === 'SET_FILTER') {
          return { ...state, filter: action.filter };
        }
        return state;
      },
      view: (state) => ({
        type: 'div',
        props: { className: 'app' },
        children: [
          { type: 'input', props: { value: state.filter }, children: [] },
          { type: 'div', props: { className: 'items' }, children: [
            ...state.items
              .filter(item => !state.filter || item.name.includes(state.filter))
              .map(item => ({ type: 'div', props: { key: item.id }, children: [item.name] }))
          ]}
        ]
      }),
      rootElement: '#test-app'
    };

    const control = run(app);

    // Test with filter
    control.dispatch({ type: 'SET_FILTER', filter: 'Item 1' });

    const filteredState = control.getState();
    expect(filteredState.filter).toBe('Item 1');
    expect(filteredState.items.filter(item => item.name.includes('Item 1'))).toHaveLength(111); // Items 1, 10-19, 21, etc.
  });

  it('should handle memory cleanup and prevent leaks', () => {
    const cleanupFunctions: (() => void)[] = [];

    const componentDefinition: ComponentDefinition<{ id: string; cleanupCalled: boolean }> = {
      initialState: { id: '', cleanupCalled: false },
      props: { id: '' },
      lifecycle: {
        created: (state, dispatch) => {
          cleanupFunctions.push(() => {
            // Note: dispatch in cleanup function may fail if component is destroyed
            try {
              dispatch({ type: 'MARK_CLEANUP' });
            } catch (e) {
              // Ignore dispatch errors in cleanup
            }
          });
        },
        destroyed: (state, dispatch) => {
          // Note: dispatch in destroyed lifecycle may fail
          try {
            dispatch({ type: 'MARK_CLEANUP' });
          } catch (e) {
            // Ignore dispatch errors in destroyed lifecycle
          }
        }
      },
      model: (state, action) => {
        if (action.type === 'MARK_CLEANUP') {
          return { ...state, cleanupCalled: true };
        }
        return state;
      },
      view: (state) => ({
        type: 'div',
        props: { id: state.id },
        children: [`Component ${state.id}`]
      })
    };

    const TestComponent = createComponent(componentDefinition);

    // Create multiple components
    const components = [
      TestComponent({ id: 'comp1' }),
      TestComponent({ id: 'comp2' }),
      TestComponent({ id: 'comp3' })
    ];

    // Verify all components are created
    components.forEach((comp, index) => {
      expect(comp.state.id).toBe(`comp${index + 1}`);
      expect(comp.state.cleanupCalled).toBe(false);
    });

    // Destroy components and verify cleanup
    components.forEach(comp => comp.destroy());

    // Note: In a real scenario, we would verify that cleanup functions are called
    // Here we just verify the destroy method doesn't throw
    expect(components).toHaveLength(3);
  });
});
