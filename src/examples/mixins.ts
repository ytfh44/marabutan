import { createMixin, createStatefulMixin } from '../mixins/core';
import { Mixin } from '../mixins/types';

/**
 * Counter mixin - provides counter functionality
 */
export const counterMixin = createStatefulMixin(
  { count: 0 },
  (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      case 'DECREMENT':
        return { ...state, count: state.count - 1 };
      case 'RESET':
        return { ...state, count: 0 };
      default:
        return state;
    }
  }
);

/**
 * Logging mixin - logs state changes
 */
export const loggingMixin = createMixin({
  initialState: {}, // Empty state to ensure mixin is included in mixed state
  lifecycle: {
    created: (state, dispatch) => {
      console.log('Component created:', state);
    },
    beforeRender: (state, dispatch) => {
      console.log('About to render:', state);
    },
    afterRender: (state, vnode) => {
      console.log('Rendered:', vnode);
    },
    destroyed: (state, dispatch) => {
      console.log('Component destroyed:', state);
    }
  }
});

/**
 * Timer mixin - provides timer functionality
 */
export const timerMixin = createMixin({
  initialState: {
    intervalId: null as number | null,
    elapsed: 0
  },
  methods: {
    startTimer: (state, dispatch) => {
      if (state.intervalId) return state;

      const intervalId = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);

      return { ...state, intervalId };
    },
    stopTimer: (state, dispatch) => {
      if (state.intervalId) {
        clearInterval(state.intervalId);
      }
      return { ...state, intervalId: null };
    }
  },
  lifecycle: {
    destroyed: (state, dispatch) => {
      if (state.intervalId) {
        clearInterval(state.intervalId);
      }
    }
  }
});

/**
 * Local storage mixin - persists state to localStorage
 */
export const localStorageMixin = createMixin({
  lifecycle: {
    created: (state, dispatch) => {
      // Try to load from localStorage
      try {
        const saved = localStorage.getItem('component-state');
        if (saved) {
          const parsedState = JSON.parse(saved);
          // Merge with current state
          Object.assign(state, parsedState);
        }
      } catch (error) {
        console.warn('Failed to load state from localStorage:', error);
      }
    },
    beforeRender: (state, dispatch) => {
      // Save to localStorage
      try {
        localStorage.setItem('component-state', JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save state to localStorage:', error);
      }
    }
  }
});

/**
 * Event handling mixin - provides common event handlers
 */
export const eventHandlingMixin = createMixin({
  handlers: {
    onClick: (state, dispatch, event) => {
      console.log('Element clicked:', event.target);
      dispatch({ type: 'CLICK', event });
    },
    onInput: (state, dispatch, event) => {
      const value = (event.target as HTMLInputElement).value;
      dispatch({ type: 'INPUT', value });
    }
  }
});
