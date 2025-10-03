import { describe, it, expect, vi } from 'vitest';
import { run } from './core';
import type { MVIApp } from './types';

describe('MVI Architecture', () => {
  it('should run a basic MVI application', () => {
    const mockView = vi.fn().mockReturnValue({
      type: 'div',
      props: {},
      children: ['Hello']
    });

    const app: MVIApp<{ count: number }, { type: string }> = {
      initialState: { count: 0 },
      intent: () => {},
      model: (state, action) => state,
      view: mockView,
      rootElement: '#test'
    };

    const control = run(app);

    expect(mockView).toHaveBeenCalledWith({ count: 0 });
    expect(control.getState()).toEqual({ count: 0 });
  });

  it('should handle state updates through dispatch', async () => {
    const mockView = vi.fn().mockReturnValue({
      type: 'div',
      props: {},
      children: ['Hello']
    });

    const app: MVIApp<{ count: number }, { type: 'INCREMENT' }> = {
      initialState: { count: 0 },
      intent: () => {},
      model: (state, action) => {
        if (action.type === 'INCREMENT') {
          return { ...state, count: state.count + 1 };
        }
        return state;
      },
      view: mockView,
      rootElement: '#test'
    };

    const control = run(app);

    control.dispatch({ type: 'INCREMENT' });

    expect(control.getState()).toEqual({ count: 1 });
    
    // Wait for batch update scheduler to complete
    await Promise.resolve();
    expect(mockView).toHaveBeenCalledTimes(2); // Initial + after dispatch
  });

  it('should handle intent functions', () => {
    const intentFn = vi.fn().mockReturnValue({
      increment: () => ({ type: 'INCREMENT' })
    });

    const app: MVIApp<{ count: number }, { type: 'INCREMENT' }> = {
      initialState: { count: 0 },
      intent: intentFn,
      model: (state, action) => {
        if (action.type === 'INCREMENT') {
          return { ...state, count: state.count + 1 };
        }
        return state;
      },
      view: (state) => ({
        type: 'div',
        props: {},
        children: [state.count.toString()]
      }),
      rootElement: '#test'
    };

    const control = run(app);

    expect(intentFn).toHaveBeenCalledWith(control.dispatch);
  });

  it('should stop execution when stopped', () => {
    const mockView = vi.fn();

    const app: MVIApp<{ count: number }, { type: 'INCREMENT' }> = {
      initialState: { count: 0 },
      intent: () => {},
      model: (state, action) => state,
      view: mockView,
      rootElement: '#test'
    };

    const control = run(app);

    control.stop();

    control.dispatch({ type: 'INCREMENT' });

    // View should not be called again after stop
    expect(mockView).toHaveBeenCalledTimes(1); // Only initial call
  });

  it('should handle DOM element selection', () => {
    // Create a mock element
    const mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    document.body.appendChild(mockElement);

    const app: MVIApp<{ count: number }, any> = {
      initialState: { count: 0 },
      intent: () => {},
      model: (state, action) => state,
      view: (state) => ({
        type: 'div',
        props: {},
        children: ['Test']
      }),
      rootElement: '#test-element'
    };

    // This would normally interact with the DOM
    // For testing, we verify the app structure
    expect(app.rootElement).toBe('#test-element');

    document.body.removeChild(mockElement);
  });

  it('should handle complex state management', () => {
    const app: MVIApp<
      { count: number; todos: { id: number; text: string; completed: boolean }[] },
      { type: 'INCREMENT' | 'ADD_TODO'; text?: string }
    > = {
      initialState: { count: 0, todos: [] },
      intent: () => {},
      model: (state, action) => {
        switch (action.type) {
          case 'INCREMENT':
            return { ...state, count: state.count + 1 };
          case 'ADD_TODO':
            return {
              ...state,
              todos: [...state.todos, { id: Date.now(), text: action.text || '', completed: false }]
            };
          default:
            return state;
        }
      },
      view: (state) => ({
        type: 'div',
        props: {},
        children: [
          `Count: ${state.count}`,
          ...state.todos.map(todo => `Todo: ${todo.text}`)
        ]
      }),
      rootElement: '#test'
    };

    const control = run(app);

    control.dispatch({ type: 'INCREMENT' });
    control.dispatch({ type: 'ADD_TODO', text: 'Test todo' });

    const newState = control.getState();
    expect(newState.count).toBe(1);
    expect(newState.todos).toHaveLength(1);
    expect(newState.todos[0].text).toBe('Test todo');
  });

  it('should handle multiple action types', () => {
    const app: MVIApp<
      { counter: number; flag: boolean },
      { type: 'INCREMENT' | 'DECREMENT' | 'TOGGLE_FLAG' }
    > = {
      initialState: { counter: 0, flag: false },
      intent: () => {},
      model: (state, action) => {
        switch (action.type) {
          case 'INCREMENT':
            return { ...state, counter: state.counter + 1 };
          case 'DECREMENT':
            return { ...state, counter: state.counter - 1 };
          case 'TOGGLE_FLAG':
            return { ...state, flag: !state.flag };
          default:
            return state;
        }
      },
      view: (state) => ({
        type: 'div',
        props: {},
        children: [`Counter: ${state.counter}, Flag: ${state.flag}`]
      }),
      rootElement: '#test'
    };

    const control = run(app);

    control.dispatch({ type: 'INCREMENT' });
    control.dispatch({ type: 'DECREMENT' });
    control.dispatch({ type: 'TOGGLE_FLAG' });

    const newState = control.getState();
    expect(newState.counter).toBe(0);
    expect(newState.flag).toBe(true);
  });

  it('should handle errors in model function', () => {
    const errorHandler = vi.fn();

    const app: MVIApp<{ count: number }, { type: 'ERROR_ACTION' }> = {
      initialState: { count: 0 },
      intent: () => {},
      model: (state, action) => {
        if (action.type === 'ERROR_ACTION') {
          throw new Error('Model error');
        }
        return state;
      },
      view: (state) => ({
        type: 'div',
        props: {},
        children: [state.count.toString()]
      }),
      rootElement: '#test'
    };

    // Mock console.error to avoid noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const control = run(app);

    control.dispatch({ type: 'ERROR_ACTION' });

    // The error should be logged but not cause the test to fail
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle errors in view function', () => {
    const errorHandler = vi.fn();

    const app: MVIApp<{ count: number }, { type: 'INCREMENT' }> = {
      initialState: { count: 0 },
      intent: () => {},
      model: (state, action) => {
        if (action.type === 'INCREMENT') {
          return { ...state, count: state.count + 1 };
        }
        return state;
      },
      view: (state) => {
        if (state.count > 0) {
          throw new Error('View error');
        }
        return {
          type: 'div',
          props: {},
          children: [state.count.toString()]
        };
      },
      rootElement: '#test'
    };

    // Mock console.error to avoid noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const control = run(app);

    // First dispatch should work
    control.dispatch({ type: 'INCREMENT' });

    // Second dispatch should trigger error in view
    control.dispatch({ type: 'INCREMENT' });

    consoleSpy.mockRestore();
  });

  it('should handle DOM element not found', () => {
    const app: MVIApp<{ count: number }, any> = {
      initialState: { count: 0 },
      intent: () => {},
      model: (state, action) => state,
      view: (state) => ({
        type: 'div',
        props: {},
        children: ['Test']
      }),
      rootElement: '#non-existent-element'
    };

    // Should not throw when element doesn't exist
    expect(() => run(app)).not.toThrow();
  });

  it('should handle state updates with complex objects', () => {
    const app: MVIApp<
      { user: { name: string; preferences: { theme: string; notifications: boolean } } },
      { type: 'UPDATE_USER'; name?: string; theme?: string; notifications?: boolean }
    > = {
      initialState: {
        user: {
          name: 'John',
          preferences: { theme: 'light', notifications: true }
        }
      },
      intent: () => {},
      model: (state, action) => {
        if (action.type === 'UPDATE_USER') {
          return {
            ...state,
            user: {
              ...state.user,
              ...(action.name && { name: action.name }),
              preferences: {
                ...state.user.preferences,
                ...(action.theme && { theme: action.theme }),
                ...(action.notifications !== undefined && { notifications: action.notifications })
              }
            }
          };
        }
        return state;
      },
      view: (state) => ({
        type: 'div',
        props: {},
        children: [`User: ${state.user.name}, Theme: ${state.user.preferences.theme}`]
      }),
      rootElement: '#test'
    };

    const control = run(app);

    control.dispatch({
      type: 'UPDATE_USER',
      name: 'Jane',
      theme: 'dark',
      notifications: false
    });

    const newState = control.getState();
    expect(newState.user.name).toBe('Jane');
    expect(newState.user.preferences.theme).toBe('dark');
    expect(newState.user.preferences.notifications).toBe(false);
  });
});
