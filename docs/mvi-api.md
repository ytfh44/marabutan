# MVI Architecture API Documentation

## Overview

The MVI (Model-View-Intent) architecture provides a unidirectional data flow pattern for building reactive applications.

## Core Types

### Intent

```typescript
type Intent<T = any> = (...args: any[]) => T;
```

A function that handles user interactions and returns actions.

### Model

```typescript
type Model<T, A> = (state: T, action: A) => T;
```

A pure function that updates state based on actions.

### View

```typescript
type View<T> = (state: T) => VNode;
```

A function that renders state to virtual DOM nodes.

### MVIApp

```typescript
interface MVIApp<T, A> {
  initialState: T;
  intent: Intent<A>;
  model: Model<T, A>;
  view: View<T>;
  rootElement: Element | string;
}
```

Complete MVI application definition.

### Dispatch

```typescript
type Dispatch<A> = (action: A) => void;
```

Function to dispatch actions to update state.

## Core Functions

### run

Runs an MVI application and returns a control interface.

```typescript
function run<T, A>(app: MVIApp<T, A>): {
  dispatch: Dispatch<A>;
  getState: () => T;
  stop: () => void;
  rerender: () => void;
}
```

**Parameters:**
- `app`: MVI application definition

**Returns:** Control interface with dispatch, state access, and lifecycle management

**Example:**
```typescript
const app = {
  initialState: { count: 0 },
  intent: (dispatch) => ({
    increment: () => dispatch({ type: 'INCREMENT' })
  }),
  model: (state, action) => {
    if (action.type === 'INCREMENT') {
      return { ...state, count: state.count + 1 };
    }
    return state;
  },
  view: (state) => createElement('div', {}, state.count.toString()),
  rootElement: '#app'
};

const control = run(app);

// Use the application
control.dispatch({ type: 'INCREMENT' });
console.log(control.getState()); // { count: 1 }
```

## Intent Functions

Intent functions handle user interactions and wire them to the dispatch function.

### Simple Intent

```typescript
function createSimpleIntent<A>(): (dispatch: Dispatch<A>) => A
```

Creates a basic intent function that returns the value as-is.

**Example:**
```typescript
const intent = createSimpleIntent();

// In your app
intent: intent
```

### Custom Intent

```typescript
const app = {
  initialState: { count: 0 },
  intent: (dispatch) => {
    // Set up event listeners, timers, etc.
    const increment = () => dispatch({ type: 'INCREMENT' });

    // Return an object with methods that can be called
    return { increment };
  },
  // ... rest of app
};
```

## Model Functions

Model functions are pure functions that update state based on the current state and an action.

### State Updates

```typescript
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
}
```

### Immutability

Always return new state objects rather than mutating existing ones:

```typescript
// Good
model: (state, action) => {
  if (action.type === 'ADD_ITEM') {
    return {
      ...state,
      items: [...state.items, action.item]
    };
  }
  return state;
}

// Bad - mutates state
model: (state, action) => {
  if (action.type === 'ADD_ITEM') {
    state.items.push(action.item); // Mutation!
    return state;
  }
  return state;
}
```

## View Functions

View functions render state to virtual DOM nodes.

### Basic View

```typescript
view: (state) => {
  return createElement('div', { className: 'app' },
    createElement('h1', {}, `Count: ${state.count}`),
    createElement('button', {
      onClick: () => ({ type: 'INCREMENT' })
    }, 'Increment')
  );
}
```

### Conditional Rendering

```typescript
view: (state) => {
  return createElement('div', {},
    state.showMessage && createElement('p', {}, 'Hello!'),
    createElement('button', {
      onClick: () => ({ type: 'TOGGLE_MESSAGE' })
    }, 'Toggle')
  );
}
```

### List Rendering

```typescript
view: (state) => {
  return createElement('ul', {},
    ...state.items.map(item =>
      createElement('li', { key: item.id }, item.text)
    )
  );
}
```

## Advanced Patterns

### Subscriptions

For side effects like timers, API calls, or WebSocket connections:

```typescript
interface MVIPApp<T, A> extends MVIApp<T, A> {
  subscriptions?: (state: T, dispatch: Dispatch<A>) => (() => void) | void;
}

const app: MVIPApp<{ time: number }, { type: 'TICK' }> = {
  initialState: { time: 0 },
  // ... other properties
  subscriptions: (state, dispatch) => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    // Return cleanup function
    return () => clearInterval(interval);
  }
};
```

### Component Integration

MVI works seamlessly with the component system:

```typescript
const MyComponent = createComponent({
  initialState: { count: 0 },
  model: (state, action) => {
    if (action.type === 'INCREMENT') {
      return { ...state, count: state.count + 1 };
    }
    return state;
  },
  view: (state) => createElement('div', {}, state.count.toString())
});

// Use in MVI app
const app = {
  initialState: { component: null },
  view: (state) => {
    const component = MyComponent();
    return createElement('div', {},
      // Render component somehow
    );
  },
  // ...
};
```

## Best Practices

### Keep Models Pure

- No side effects in model functions
- No async operations
- No direct DOM access
- Always return new state objects

### Use Meaningful Action Types

```typescript
// Good
{ type: 'USER_LOGGED_IN', payload: { userId: 123 } }

// Bad
{ type: 'UPDATE', data: user }
```

### Structure Large Applications

```typescript
// Separate files for related logic
const app = {
  initialState: combineInitialStates(
    authInitialState,
    todosInitialState,
    uiInitialState
  ),
  model: combineModels(
    authModel,
    todosModel,
    uiModel
  ),
  view: (state) => createElement(AppLayout, {}, renderApp(state))
};
```

## Error Handling

```typescript
model: (state, action) => {
  try {
    // State update logic
    return newState;
  } catch (error) {
    console.error('Model error:', error);
    return state; // Return current state on error
  }
}

view: (state) => {
  try {
    return renderFunction(state);
  } catch (error) {
    console.error('View error:', error);
    return createElement('div', {}, 'Error rendering');
  }
}
```

## Performance Considerations

- Models should be fast and synchronous
- Views should avoid expensive computations
- Use `key` props for list items to optimize diffing
- Minimize virtual DOM tree depth
