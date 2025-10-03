import type { VNode } from '../vdom/types';
import { diff, patch } from '../vdom';
import type { MVIApp, Dispatch, MVIControl } from './types';
import { scheduler } from '../utils/scheduler';

/**
 * Run an MVI application with improved type safety and error handling
 */
export function run<T extends Record<string, unknown> = Record<string, unknown>, A = unknown>(
  app: MVIApp<T, A>
): MVIControl<T, A> {
  let currentState = app.initialState;
  let currentVNode: VNode | null = null;
  let isRunning = true;
  let stateSubscribers: ((state: T) => void)[] = [];

  // Create dispatch function
  const dispatch: Dispatch<A> = (action: A) => {
    if (!isRunning) return;

    try {
      // Update state
      currentState = app.model(currentState, action);

      // Notify subscribers
      stateSubscribers.forEach(subscriber => {
        try {
          subscriber(currentState);
        } catch (error) {
          console.error('Error in state subscriber:', error);
        }
      });

      // Re-render (batched to avoid multiple renders from consecutive dispatches)
      scheduler.schedule(() => render());
    } catch (error) {
      console.error('Error during state update:', error);
    }
  };

  // Render function
  const render = () => {
    if (!isRunning) return;

    try {
      // Generate new virtual DOM
      const newVNode = app.view(currentState);

      // Diff with previous virtual DOM
      const patchResult = diff(currentVNode, newVNode);

      // Apply patches to actual DOM
      const rootElement = getRootElement(app.rootElement);
      if (rootElement) {
        patch(rootElement, patchResult.patches);
      }

      currentVNode = patchResult.newVNode || null;
    } catch (error) {
      console.error('Error during rendering:', error);
      throw error;
    }
  };

  // Handle intent
  try {
    app.intent(dispatch);
  } catch (error) {
    console.error('Error in intent function:', error);
  }

  // Initial render
  render();

  // Return control interface
  return {
    dispatch,
    getState: () => currentState,
    stop: () => {
      isRunning = false;
      stateSubscribers = [];
    },
    rerender: render,
    subscribe: (callback: (state: T) => void) => {
      stateSubscribers.push(callback);
      return () => {
        const index = stateSubscribers.indexOf(callback);
        if (index > -1) {
          stateSubscribers.splice(index, 1);
        }
      };
    },
  };
}

/**
 * Get root element from string selector or Element
 */
function getRootElement(rootElement: Element | string): Element | null {
  if (typeof rootElement === 'string') {
    return document.querySelector(rootElement);
  } else if (rootElement instanceof Element) {
    return rootElement;
  }
  return null;
}

/**
 * Create a simple intent function that returns the value as-is
 */
export function createSimpleIntent<A = unknown>(): (dispatch: Dispatch<A>) => void {
  return (dispatch: Dispatch<A>) => {
    // This would be implemented by user code
    // For now, return a placeholder
  };
}

/**
 * Create a simple model function that returns state unchanged
 */
export function createSimpleModel<T extends Record<string, unknown>, A = unknown>(): (state: T, action: A) => T {
  return (state: T, action: A) => state;
}

/**
 * Create a simple view function that returns a basic div
 */
export function createSimpleView<T = Record<string, unknown>>(): (state: T) => VNode {
  return (state: T) => ({
    type: 'div',
    props: {},
    children: ['Hello, MVI!']
  });
}
