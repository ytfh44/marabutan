import { describe, it, expect, vi } from 'vitest';
import { counterMixin, loggingMixin, timerMixin } from './mixins';
import { CounterComponent, TimerComponent, TodoListComponent } from './components';

describe('Examples', () => {
  describe('Mixins', () => {
    it('should create counter mixin correctly', () => {
      expect(counterMixin.initialState).toEqual({ count: 0 });
      expect(counterMixin.methods).toBeDefined();
    });

    it('should create logging mixin correctly', () => {
      expect(loggingMixin.lifecycle).toBeDefined();
      expect(loggingMixin.lifecycle?.created).toBeDefined();
      expect(loggingMixin.lifecycle?.beforeRender).toBeDefined();
      expect(loggingMixin.lifecycle?.afterRender).toBeDefined();
      expect(loggingMixin.lifecycle?.destroyed).toBeDefined();
    });

    it('should create timer mixin correctly', () => {
      expect(timerMixin.initialState).toEqual({
        intervalId: null,
        elapsed: 0
      });
      expect(timerMixin.methods?.startTimer).toBeDefined();
      expect(timerMixin.methods?.stopTimer).toBeDefined();
    });
  });

  describe('Components', () => {
    it('should create CounterComponent correctly', () => {
      const component = CounterComponent();

      expect(component.definition.displayName).toBe('Counter');
      expect(component.state.displayValue).toBe(0);
      expect(component.definition.mixins?.counter).toBe(counterMixin);
      expect(component.definition.mixins?.logger).toBe(loggingMixin);
    });

    it('should create TimerComponent correctly', () => {
      const component = TimerComponent();

      expect(component.definition.displayName).toBe('Timer');
      expect(component.state.time).toBe(0);
      expect(component.definition.mixins?.timer).toBe(timerMixin);
      expect(component.definition.mixins?.logger).toBe(loggingMixin);
    });

    it('should create TodoListComponent correctly', () => {
      const component = TodoListComponent();

      expect(component.definition.displayName).toBe('TodoList');
      expect(component.state.todos).toHaveLength(3);
      expect(component.state.newTodoText).toBe('');
      expect(component.definition.mixins?.storage).toBeDefined();
    });

    it('should handle counter component state updates', () => {
      const component = CounterComponent();

      // The counter mixin should handle INCREMENT actions
      component.dispatch({ type: 'INCREMENT' });

      expect(component.state.displayValue).toBe(1);
    });

    it('should handle timer component state updates', () => {
      const component = TimerComponent();

      // Test timer actions
      component.dispatch({ type: 'TICK' });

      expect(component.state.time).toBe(1);
    });

    it('should handle todo list state updates', () => {
      const component = TodoListComponent();

      // Add a new todo
      component.dispatch({ type: 'UPDATE_NEW_TODO', text: 'New todo' });
      component.dispatch({ type: 'ADD_TODO' });

      expect(component.state.todos).toHaveLength(4);
      expect(component.state.todos[3].text).toBe('New todo');
      expect(component.state.newTodoText).toBe('');
    });

    it('should render components correctly', () => {
      const counterComponent = CounterComponent();
      const timerComponent = TimerComponent();
      const todoComponent = TodoListComponent();

      const counterVNode = counterComponent.render();
      const timerVNode = timerComponent.render();
      const todoVNode = todoComponent.render();

      expect(counterVNode.type).toBe('div');
      expect(counterVNode.props.className).toBe('counter');

      expect(timerVNode.type).toBe('div');
      expect(timerVNode.props.className).toBe('timer');

      expect(todoVNode.type).toBe('div');
      expect(todoVNode.props.className).toBe('todo-list');
    });
  });

  describe('Integration', () => {
    it('should work with the full framework stack', () => {
      // This test verifies that all parts work together
      const counterComponent = CounterComponent();

      // Should have access to mixin state
      expect(counterComponent.getMixedState()).toHaveProperty('counter');
      expect(counterComponent.getMixedState()).toHaveProperty('logger');

      // Check the structure of mixed state
      expect(counterComponent.getMixedState().counter).toEqual({ count: 0 });
      expect(counterComponent.getMixedState().logger).toBeDefined();

      // Should be able to dispatch actions
      counterComponent.dispatch({ type: 'INCREMENT' });
      expect(counterComponent.state.displayValue).toBe(1);

      // Should be able to render
      const vnode = counterComponent.render();
      expect(vnode).toBeDefined();
      expect(vnode.children).toHaveLength(4); // h2 + 3 buttons
    });
  });
});
