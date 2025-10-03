# Components API Documentation

## Overview

The component system provides a way to create reusable, stateful UI components with lifecycle management, props, and mixin support.

## Core Types

### ComponentProps

```typescript
interface ComponentProps extends BaseProps {
  [key: string]: unknown;
}

interface BaseProps {
  key?: string | number;
  children?: VNode[];
  className?: string;
  id?: string;
  style?: Record<string, string | number>;
}
```

### ComponentDefinition

```typescript
interface ComponentDefinition<T = Record<string, unknown>, P extends ComponentProps = ComponentProps> {
  displayName?: string;
  initialState: T;
  props?: Partial<P>;
  intent?: Intent<unknown>;
  model?: Model<T, unknown>;
  view: View<T>;
  mixins?: Record<string, Mixin<T>>;
  lifecycle?: MixinLifecycle<T>;
}
```

### ComponentInstance

```typescript
interface ComponentInstance<T = Record<string, unknown>, P extends ComponentProps = ComponentProps> {
  readonly definition: ComponentDefinition<T, P>;
  state: T;
  props: P;
  dispatch: Dispatch<unknown>;
  render: () => VNode;
  updateProps: (newProps: Partial<P>) => void;
  destroy: () => void;
  getMixedState: () => MixedState<T, NonNullable<ComponentDefinition<T, P>['mixins']>>;
}
```

### ComponentFactory

```typescript
type ComponentFactory<T = Record<string, unknown>, P extends ComponentProps = ComponentProps> = (
  props?: P
) => ComponentInstance<T, P>;
```

## Core Functions

### createComponent

Creates a component factory from a definition.

```typescript
function createComponent<T extends Record<string, unknown>, P extends ComponentProps = ComponentProps>(
  definition: ComponentDefinition<T, P>
): ComponentFactory<T, P>
```

**Parameters:**
- `definition`: Component definition object

**Returns:** Component factory function

**Example:**
```typescript
const ButtonComponent = createComponent({
  displayName: 'Button',
  initialState: { isPressed: false },

  view: (state) => createElement('button', {
    className: state.isPressed ? 'pressed' : 'normal',
    onClick: () => ({ type: 'PRESS' })
  }, 'Click me')
});

const button = ButtonComponent({ variant: 'primary' });
```

### registerComponent

Registers a component in the global registry.

```typescript
function registerComponent<T extends Record<string, unknown>, P extends ComponentProps>(
  name: string,
  definition: ComponentDefinition<T, P>
): ComponentFactory<T, P>
```

**Parameters:**
- `name`: Component name for registry
- `definition`: Component definition

**Returns:** Component factory

### getComponent

Retrieves a component from the global registry.

```typescript
function getComponent<T extends Record<string, unknown> = Record<string, unknown>, P extends ComponentProps = ComponentProps>(
  name: string
): ComponentFactory<T, P> | undefined
```

**Parameters:**
- `name`: Component name

**Returns:** Component factory or undefined

### createComponentInstance

Creates a cached component instance from the registry.

```typescript
function createComponentInstance<T extends Record<string, unknown>, P extends ComponentProps>(
  name: string,
  props?: P
): ComponentInstance<T, P> | undefined
```

**Parameters:**
- `name`: Component name
- `props`: Component props (optional)

**Returns:** Component instance or undefined

### getComponentInstance

Gets a cached component instance from the registry.

```typescript
function getComponentInstance<T extends Record<string, unknown>, P extends ComponentProps>(
  name: string
): ComponentInstance<T, P> | undefined
```

**Parameters:**
- `name`: Component name

**Returns:** Component instance or undefined

### registerErrorHandler

Registers a global error handler for component errors.

```typescript
function registerErrorHandler(handler: ErrorBoundaryHandler): () => void
```

**Parameters:**
- `handler`: Error handler function

**Returns:** Cleanup function

## Component Definition

### initialState

The initial state object for the component.

```typescript
initialState: {
  count: 0,
  isLoading: false,
  data: null
}
```

### props (Optional)

Default props for the component.

```typescript
props: {
  variant: 'default' as 'default' | 'primary' | 'secondary',
  size: 'medium' as 'small' | 'medium' | 'large'
}
```

### mixins (Optional)

Mixins to apply to the component.

```typescript
mixins: {
  counter: counterMixin,
  logger: loggingMixin
}
```

### model (Optional)

State update function. Defaults to identity function.

```typescript
model: (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'RESET':
      return { ...state, count: 0 };
    default:
      return state;
  }
}
```

### view (Required)

Render function that converts state to virtual DOM.

```typescript
view: (state) => {
  return createElement('div', { className: 'counter' },
    createElement('span', {}, state.count.toString()),
    createElement('button', {
      onClick: () => ({ type: 'INCREMENT' })
    }, '+')
  );
}
```

### lifecycle (Optional)

Lifecycle hooks for the component.

```typescript
lifecycle: {
  created: (state, dispatch) => {
    console.log('Component created');
  },

  beforeRender: (state, dispatch) => {
    // Called before each render
  },

  afterRender: (state, vnode) => {
    // Called after each render
  },

  destroyed: (state, dispatch) => {
    console.log('Component destroyed');
  }
}
```

## Component Instance

### Properties

#### definition

The original component definition.

```typescript
const instance = MyComponent();
console.log(instance.definition.displayName); // 'MyComponent'
```

#### state

Current component state.

```typescript
console.log(instance.state); // { count: 0, isLoading: false }
```

#### props

Current component props.

```typescript
console.log(instance.props); // { variant: 'primary' }
```

#### dispatch

Function to dispatch actions.

```typescript
instance.dispatch({ type: 'INCREMENT' });
```

### Methods

#### render()

Renders the component to a virtual DOM node.

```typescript
const vnode = instance.render();
console.log(vnode.type); // 'div'
```

#### updateProps(newProps)

Updates component props and triggers re-render.

```typescript
instance.updateProps({ variant: 'secondary' });
```

#### destroy()

Destroys the component and cleans up resources.

```typescript
instance.destroy();
```

#### getMixedState()

Returns the complete state including mixin states.

```typescript
const mixedState = instance.getMixedState();
// { count: 0, counter: { value: 0 }, logger: {} }
```

## Usage Examples

### Basic Component

```typescript
const CounterComponent = createComponent({
  displayName: 'Counter',
  initialState: { count: 0 },

  model: (state, action) => {
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
  },

  view: (state) => createElement('div', { className: 'counter' },
    createElement('h2', {}, `Count: ${state.count}`),
    createElement('button', {
      onClick: () => ({ type: 'INCREMENT' })
    }, '+'),
    createElement('button', {
      onClick: () => ({ type: 'DECREMENT' })
    }, '-'),
    createElement('button', {
      onClick: () => ({ type: 'RESET' })
    }, 'Reset')
  )
});

// Use the component
const counter = CounterComponent();
document.body.appendChild(counter.render());
```

### Component with Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  children?: VNode[];
}

const ButtonComponent = createComponent<{}, ButtonProps>({
  displayName: 'Button',
  initialState: {},

  props: {
    variant: 'primary',
    size: 'medium'
  },

  view: (state, props) => {
    const className = `button ${props.variant} ${props.size}`;

    return createElement('button', {
      className,
      onClick: props.onClick
    }, ...(props.children || []));
  }
});

// Use with props
const PrimaryButton = ButtonComponent({
  variant: 'primary',
  size: 'large',
  onClick: () => console.log('Clicked!')
}, 'Click me');
```

### Component with Mixins

```typescript
const TodoItemComponent = createComponent({
  displayName: 'TodoItem',
  initialState: {
    text: '',
    completed: false
  },

  mixins: {
    // Event handling mixin
    events: createMixin({
      handlers: {
        onToggle: (state, dispatch, event) => {
          dispatch({ type: 'TOGGLE_COMPLETED' });
        },

        onDelete: (state, dispatch, event) => {
          dispatch({ type: 'DELETE_ITEM' });
        }
      }
    })
  },

  model: (state, action) => {
    switch (action.type) {
      case 'TOGGLE_COMPLETED':
        return { ...state, completed: !state.completed };
      case 'DELETE_ITEM':
        // Handle deletion
        return state;
      default:
        return state;
    }
  },

  view: (state) => createElement('div', {
    className: `todo-item ${state.completed ? 'completed' : ''}`
  },
    createElement('input', {
      type: 'checkbox',
      checked: state.completed,
      onChange: (event) => ({ type: 'TOGGLE_COMPLETED' })
    }),
    createElement('span', {}, state.text),
    createElement('button', {
      onClick: () => ({ type: 'DELETE_ITEM' })
    }, 'Delete')
  )
});
```

### Component Composition

```typescript
const TodoListComponent = createComponent({
  displayName: 'TodoList',
  initialState: {
    todos: [],
    newTodoText: ''
  },

  model: (state, action) => {
    switch (action.type) {
      case 'ADD_TODO':
        if (state.newTodoText.trim()) {
          const newTodo = {
            id: Date.now(),
            text: state.newTodoText.trim(),
            completed: false
          };
          return {
            ...state,
            todos: [...state.todos, newTodo],
            newTodoText: ''
          };
        }
        return state;

      case 'TOGGLE_TODO':
        return {
          ...state,
          todos: state.todos.map(todo =>
            todo.id === action.id
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        };

      default:
        return state;
    }
  },

  view: (state) => createElement('div', { className: 'todo-list' },
    createElement('h2', {}, 'My Todos'),

    createElement('div', { className: 'add-todo' },
      createElement('input', {
        type: 'text',
        value: state.newTodoText,
        placeholder: 'What needs to be done?',
        onInput: (e) => ({
          type: 'UPDATE_NEW_TODO',
          text: (e.target as HTMLInputElement).value
        })
      }),
      createElement('button', {
        onClick: () => ({ type: 'ADD_TODO' })
      }, 'Add')
    ),

    createElement('ul', {},
      ...state.todos.map(todo =>
        createElement('li', { key: todo.id },
          createElement(TodoItemComponent, {
            todo,
            onToggle: (id) => ({ type: 'TOGGLE_TODO', id }),
            onDelete: (id) => ({ type: 'DELETE_TODO', id })
          })
        )
      )
    )
  )
});
```

### Global Component Registry

```typescript
// Register components globally
registerComponent('Counter', CounterComponent);
registerComponent('TodoList', TodoListComponent);

// Later, retrieve and use
const Counter = getComponent('Counter');
if (Counter) {
  const counter = Counter();
  // Use counter...
}
```

## Lifecycle Management

Components have a well-defined lifecycle:

1. **Creation**: Component instance is created, mixins are applied
2. **Created Hook**: `lifecycle.created` is called
3. **Initial Render**: Component renders for the first time
4. **Before Render Hook**: `lifecycle.beforeRender` is called before each render
5. **Render**: Component re-renders when state changes
6. **After Render Hook**: `lifecycle.afterRender` is called after each render
7. **Destruction**: Component is destroyed, cleanup occurs
8. **Destroyed Hook**: `lifecycle.destroyed` is called

## Error Handling

The component system includes comprehensive error handling with the following features:

### Global Error Handlers

```typescript
import { registerErrorHandler } from './components/core';

const cleanup = registerErrorHandler((error, errorInfo) => {
  console.error('Global component error:', error);
  // Send to error reporting service, etc.
});

// Later, cleanup
cleanup();
```

### Error Context

Errors are automatically logged with rich context information:
- Component name and lifecycle phase
- Current state and props
- Action that triggered the error
- Full stack trace

### Error Boundaries

```typescript
interface ErrorBoundaryProps extends ComponentProps {
  fallback?: (error: Error) => VNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

const ErrorBoundary = createComponent({
  initialState: { hasError: false, error: null },
  view: (state) => {
    if (state.hasError) {
      return state.fallback ?
        state.fallback(state.error!) :
        createElement('div', { className: 'error' }, 'Something went wrong');
    }
    return state.children;
  }
});
```

## Best Practices

### Keep Components Pure

```typescript
// Good - pure component
const DisplayComponent = createComponent({
  view: (state) => createElement('div', {}, state.message)
});

// Bad - side effects in view
const BadComponent = createComponent({
  view: (state) => {
    fetch('/api/data').then(/* ... */); // Side effect!
    return createElement('div', {}, state.message);
  }
});
```

### Use Props for Configuration

```typescript
// Good - configurable via props
const CardComponent = createComponent({
  props: {
    title: 'Default Title',
    variant: 'default' as 'default' | 'primary'
  },

  view: (state, props) => createElement('div', {
    className: `card ${props.variant}`
  }, props.title)
});

// Use with different configurations
const PrimaryCard = CardComponent({ variant: 'primary', title: 'Important' });
const DefaultCard = CardComponent({ title: 'Normal' });
```

### Handle Props Changes

```typescript
const DataComponent = createComponent({
  initialState: { data: null, loading: false },

  model: (state, action) => {
    if (action.type === 'PROPS_CHANGED') {
      // Handle prop changes
      return { ...state, data: action.newProps.data };
    }
    return state;
  }
});
```

### Error Boundaries

```typescript
const SafeComponent = createComponent({
  initialState: { hasError: false, error: null },

  model: (state, action) => {
    if (action.type === 'ERROR') {
      return { ...state, hasError: true, error: action.error };
    }
    return state;
  },

  view: (state) => {
    if (state.hasError) {
      return createElement('div', { className: 'error' },
        'Something went wrong: ', state.error.message
      );
    }

    try {
      return createElement(UnstableComponent, {});
    } catch (error) {
      return createElement('div', { className: 'error' }, 'Error occurred');
    }
  }
});
```

## Performance Considerations

### Memoization

```typescript
const ExpensiveComponent = createComponent({
  initialState: { items: [] },

  view: (state) => {
    // Expensive computation - memoize if possible
    const processedItems = state.items.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }));

    return createElement('ul', {},
      ...processedItems.map(item =>
        createElement('li', { key: item.id }, item.processed)
      )
    );
  }
});
```

### Keys for Lists

```typescript
view: (state) => createElement('ul', {},
  ...state.todos.map(todo =>
    createElement('li', { key: todo.id }, todo.text)
  )
);
```

### Conditional Rendering

```typescript
view: (state) => createElement('div', {},
  state.showExtra && createElement(ExpensiveComponent, {}),
  createElement(ButtonComponent, {
    onClick: () => ({ type: 'TOGGLE_EXTRA' })
  }, 'Toggle')
);
```

## Testing Components

```typescript
describe('CounterComponent', () => {
  it('should render initial state', () => {
    const component = CounterComponent();
    const vnode = component.render();

    expect(vnode.type).toBe('div');
    expect(vnode.props.className).toBe('counter');
  });

  it('should update state on dispatch', () => {
    const component = CounterComponent();

    component.dispatch({ type: 'INCREMENT' });

    expect(component.state.count).toBe(1);
  });

  it('should handle props correctly', () => {
    const component = ButtonComponent({ variant: 'primary' });

    expect(component.props.variant).toBe('primary');
  });
});
```

## Advanced Patterns

### Higher-Order Components

```typescript
const withLogging = (ComponentDefinition) => {
  return createComponent({
    ...ComponentDefinition,
    mixins: {
      ...ComponentDefinition.mixins,
      logger: loggingMixin
    }
  });
};

const LoggedCounter = withLogging(CounterComponent);
```

### Render Props

```typescript
const DataProviderComponent = createComponent({
  initialState: { data: null, loading: true },

  model: (state, action) => {
    if (action.type === 'DATA_LOADED') {
      return { ...state, data: action.data, loading: false };
    }
    return state;
  },

  view: (state) => {
    return state.children ?
      state.children(state.data, state.loading) :
      createElement('div', {}, 'No children provided');
  }
});

// Usage
createElement(DataProviderComponent, {},
  (data, loading) => loading ?
    createElement('div', {}, 'Loading...') :
    createElement('div', {}, `Data: ${data}`)
);
```

### Portals

```typescript
const PortalComponent = createComponent({
  initialState: { mounted: false },

  view: (state) => {
    if (!state.mounted) return null;

    // In a real implementation, you would render to a different DOM node
    return createElement('div', { className: 'portal' },
      'This renders outside the normal flow'
    );
  }
});
```

This component system provides a solid foundation for building complex, maintainable user interfaces with proper state management, lifecycle handling, and component composition.
