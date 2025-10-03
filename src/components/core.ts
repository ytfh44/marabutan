import type { VNode } from '../vdom/types';
import type { Dispatch } from '../mvi/types';
import type {
  ComponentDefinition,
  ComponentInstance,
  ComponentFactory,
  ComponentProps
} from './types';
import { applyMixins, executeLifecycle } from '../mixins/core';
import type { MixedState } from '../mixins/types';
import { scheduler } from '../utils/scheduler';

/**
 * Error handler type
 */
export type ErrorHandler = (error: Error, context?: {
  component?: string;
  lifecycle?: string;
  action?: unknown;
}) => void;

/**
 * Global error handlers
 */
const errorHandlers: ErrorHandler[] = [];

/**
 * Handle component errors
 */
function handleError(error: Error, context?: {
  component?: string;
  lifecycle?: string;
  action?: unknown;
}): void {
  if (errorHandlers.length > 0) {
    errorHandlers.forEach(handler => {
      try {
        handler(error, context);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  } else {
    console.error('Component error:', error, context);
  }
}

/**
 * Register a global error handler
 * Returns a cleanup function to unregister the handler
 */
export function registerErrorHandler(handler: ErrorHandler): () => void {
  errorHandlers.push(handler);
  return () => {
    const index = errorHandlers.indexOf(handler);
    if (index !== -1) {
      errorHandlers.splice(index, 1);
    }
  };
}

/**
 * Create a component from a definition
 * 
 * @param definition - Component definition with state, view, and optional lifecycle
 * @returns Component factory function that creates component instances
 */
export function createComponent<T extends object = Record<string, unknown>, P extends ComponentProps = ComponentProps>(
  definition: ComponentDefinition<T, P>
): ComponentFactory<T, P> {
  // Return a factory function that creates component instances
  return (props?: P): ComponentInstance<T, P> => {
    // Track if component is destroyed
    let isDestroyed = false;
    
    // Context订阅清理函数列表
    const contextUnsubscribers: Array<() => void> = [];
    
    // 强制更新回调（在instance创建后设置）
    let forceUpdateCallback: (() => void) | undefined;

    // Apply mixins if present
    const appliedMixins = definition.mixins 
      ? applyMixins(definition.initialState, definition.mixins)
      : {
          initialState: definition.initialState,
          lifecycle: definition.lifecycle || {},
          computed: {},
          methods: {},
          handlers: {}
        };

    // Initialize component state
    // Merge props into state if there are matching fields
    const mergedState = { ...appliedMixins.initialState, ...props } as T;
    let currentState: T = mergedState;
    let currentProps: P = { ...(definition.props || {}), ...props } as P;

    // Create dispatch function
    const dispatch: Dispatch<unknown> = (action: unknown) => {
      if (isDestroyed) {
        throw new Error(`Cannot dispatch on destroyed component: ${definition.displayName || 'Unknown'}`);
      }

      try {
        // Call model function if present
        if (definition.model) {
          const newState = definition.model(currentState, action) as T | Promise<T>;
          
          // Check if model returns a Promise
          if (newState && typeof (newState as any).then === 'function') {
            // Handle async model function
            (newState as Promise<T>).then(resolvedState => {
              currentState = resolvedState;
              // Update instance state reference
              instance.state = currentState;
              // Re-render after async state update
              try {
                instance.render();
              } catch (renderError) {
                handleError(renderError as Error, {
                  component: definition.displayName,
                  lifecycle: 'render'
                });
              }
            }).catch(error => {
              handleError(error as Error, {
                component: definition.displayName,
                action
              });
            });
            return; // Don't render synchronously for async models
          } else {
            currentState = newState as T;
            // Update instance state reference
            instance.state = currentState;
          }
        }

        // Re-render after state update (synchronous models only)
        // Use scheduler to batch multiple updates
        scheduler.schedule(() => {
          try {
            instance.render();
          } catch (renderError) {
            handleError(renderError as Error, {
              component: definition.displayName,
              lifecycle: 'render'
            });
          }
        });
      } catch (error) {
        handleError(error as Error, {
          component: definition.displayName,
          action
        });
        throw error;
      }
    };

    // Create component instance
    const instance: ComponentInstance<T, P> = {
      definition,
      state: currentState,
      props: currentProps,
      dispatch,
      contextUnsubscribers,
      
      forceUpdate(): void {
        if (forceUpdateCallback && !isDestroyed) {
          forceUpdateCallback();
        }
      },

      render(): VNode {
        if (isDestroyed) {
          throw new Error(`Cannot render destroyed component: ${definition.displayName || 'Unknown'}`);
        }

        try {
          // Execute beforeRender lifecycle
          if (appliedMixins.lifecycle.beforeRender) {
            executeLifecycle(appliedMixins.lifecycle, 'beforeRender', currentState, dispatch);
          }

          // Call view function
          const vnode = definition.view(currentState, dispatch);

          // Attach component instance to vnode for automatic cleanup
          // This allows applyDelete to call destroy() when the vnode is removed
          (vnode as any).__componentInstance = instance;

          // Execute afterRender lifecycle
          if (appliedMixins.lifecycle.afterRender) {
            executeLifecycle(appliedMixins.lifecycle, 'afterRender', currentState, dispatch, vnode);
          }

          return vnode;
        } catch (error) {
          handleError(error as Error, {
            component: definition.displayName,
            lifecycle: 'render'
          });
          throw error;
        }
      },

      updateProps(newProps: Partial<P>): void {
        if (isDestroyed) {
          console.warn(`updateProps called on destroyed component: ${definition.displayName || 'Unknown'}`);
          return;
        }

        currentProps = { ...currentProps, ...newProps };
        instance.props = currentProps;

        // Re-render with new props (batched)
        scheduler.schedule(() => {
          try {
            instance.render();
          } catch (error) {
            handleError(error as Error, {
              component: definition.displayName,
              lifecycle: 'updateProps'
            });
          }
        });
      },

      destroy(): void {
        if (isDestroyed) {
          return; // Already destroyed
        }

        try {
          // 清理context订阅
          contextUnsubscribers.forEach(unsub => {
            try {
              unsub();
            } catch (error) {
              console.error('Error unsubscribing from context:', error);
            }
          });
          contextUnsubscribers.length = 0;
          
          // Execute destroyed lifecycle
          if (appliedMixins.lifecycle.destroyed) {
            executeLifecycle(appliedMixins.lifecycle, 'destroyed', currentState, dispatch);
          }

          isDestroyed = true;
        } catch (error) {
          handleError(error as Error, {
            component: definition.displayName,
            lifecycle: 'destroyed'
          });
        }
      },

      getMixedState(): MixedState<T, NonNullable<ComponentDefinition<T, P>['mixins']>> {
        return currentState as MixedState<T, NonNullable<ComponentDefinition<T, P>['mixins']>>;
      }
    };

    // 设置forceUpdate回调
    forceUpdateCallback = () => {
      try {
        instance.render();
      } catch (error) {
        handleError(error as Error, {
          component: definition.displayName,
          lifecycle: 'forceUpdate'
        });
      }
    };
    
    // Execute created lifecycle
    try {
      if (appliedMixins.lifecycle.created) {
        executeLifecycle(appliedMixins.lifecycle, 'created', currentState, dispatch);
      }
    } catch (error) {
      handleError(error as Error, {
        component: definition.displayName,
        lifecycle: 'created'
      });
      throw error;
    }

    return instance;
  };
}

/**
 * Component Registry
 * Manages named components and their instances
 */
export class ComponentRegistry {
  private components = new Map<string, ComponentFactory<any, any>>();
  private instances = new Map<string, ComponentInstance<any, any>>();

  /**
   * Register a component factory with a name
   */
  register<T extends object, P extends ComponentProps>(
    name: string,
    factory: ComponentFactory<T, P>
  ): void {
    this.components.set(name, factory);
  }

  /**
   * Get a registered component factory by name
   */
  get<T extends object, P extends ComponentProps>(name: string): ComponentFactory<T, P> | undefined {
    return this.components.get(name);
  }

  /**
   * Check if a component is registered
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Unregister a component
   */
  unregister(name: string): boolean {
    // Destroy instance if exists
    const instance = this.instances.get(name);
    if (instance) {
      instance.destroy();
      this.instances.delete(name);
    }

    return this.components.delete(name);
  }

  /**
   * Get all registered component names
   */
  getNames(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Get all registered component names (alias for getNames)
   */
  getAll(): string[] {
    return this.getNames();
  }

  /**
   * Get registry statistics
   */
  getStats(): { count: number; names: string[]; componentCount?: number; instanceCount?: number } {
    const names = this.getNames();
    return {
      count: names.length,
      names,
      componentCount: this.components.size,
      instanceCount: this.instances.size
    };
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    // Destroy all instances
    this.instances.forEach(instance => instance.destroy());
    this.instances.clear();
    this.components.clear();
  }

  /**
   * Create and cache a component instance
   */
  createInstance<T extends object, P extends ComponentProps>(
    name: string,
    props?: P
  ): ComponentInstance<T, P> | null {
    const factory = this.components.get(name);
    if (!factory) {
      console.warn(`Component not found: ${name}`);
      return null;
    }

    const instance = factory(props);
    this.instances.set(name, instance);
    return instance;
  }

  /**
   * Get a cached component instance
   */
  getInstance<T extends object, P extends ComponentProps>(name: string): ComponentInstance<T, P> | undefined {
    return this.instances.get(name);
  }
}

/**
 * Default global component registry
 */
const defaultRegistry = new ComponentRegistry();

/**
 * Register a component in the global registry
 * 
 * @param name - Component name
 * @param definition - Component definition
 * @returns Component factory
 */
export function registerComponent<T extends object = Record<string, unknown>, P extends ComponentProps = ComponentProps>(
  name: string,
  definition: ComponentDefinition<T, P>
): ComponentFactory<T, P> {
  const factory = createComponent(definition);
  defaultRegistry.register(name, factory);
  return factory;
}

/**
 * Create a component instance from the global registry
 * 
 * @param name - Component name
 * @param props - Component props
 * @returns Component instance or null if not found
 */
export function createComponentInstance<T extends object = Record<string, unknown>, P extends ComponentProps = ComponentProps>(
  name: string,
  props?: P
): ComponentInstance<T, P> | null {
  return defaultRegistry.createInstance(name, props);
}

/**
 * Get the default global registry
 */
export function getDefaultRegistry(): ComponentRegistry {
  return defaultRegistry;
}

/**
 * Get a component instance from the global registry
 * 
 * @param name - Component name
 * @returns Component instance or undefined if not found
 */
export function getComponentInstance<T extends object = Record<string, unknown>, P extends ComponentProps = ComponentProps>(
  name: string
): ComponentInstance<T, P> | undefined {
  return defaultRegistry.getInstance(name);
}

