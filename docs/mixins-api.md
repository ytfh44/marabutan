# Mixins API Documentation

## Overview

The mixins system allows you to share logic and state across components through composable, reusable behaviors.

## Core Types

### Mixin

```typescript
interface Mixin<T = any, M = any> {
  initialState?: M;
  lifecycle?: MixinLifecycle<T & M>;
  mergeState?: StateMerger<T, M>;
  computed?: Record<string, (state: T & M) => any>;
  methods?: Record<string, (state: T & M, dispatch: Dispatch<any>, ...args: any[]) => any>;
  handlers?: Record<string, (state: T & M, dispatch: Dispatch<any>, event: any) => void>;
}
```

### MixinLifecycle

```typescript
interface MixinLifecycle<T = any> {
  created?(state: T, dispatch: Dispatch<any>): void;
  beforeRender?(state: T, dispatch: Dispatch<any>): void;
  afterRender?(state: T, vnode: VNode): void;
  destroyed?(state: T, dispatch: Dispatch<any>): void;
}
```

### MixedState

```typescript
type MixedState<T, M extends Record<string, Mixin>> = T & {
  [K in keyof M]: M[K] extends Mixin<any, infer MS> ? MS : never;
};
```

## Core Functions

### createMixin

Creates a mixin definition.

```typescript
function createMixin<T = any, M = any>(mixin: Mixin<T, M>): Mixin<T, M>
```

**Parameters:**
- `mixin`: Mixin definition object

**Returns:** Configured mixin

**Example:**
```typescript
const loggingMixin = createMixin({
  initialState: { logs: [] },
  lifecycle: {
    created: (state, dispatch) => {
      console.log('Component created');
    }
  },
  methods: {
    log: (state, dispatch, message) => {
      const newLogs = [...state.logs, message];
      dispatch({ type: 'UPDATE_LOGS', logs: newLogs });
    }
  }
});
```

### createStatefulMixin

Creates a mixin that manages its own state with a reducer.

```typescript
function createStatefulMixin<T, M>(
  initialState: M,
  reducer?: (state: M, action: any) => M
): Mixin<T, M>
```

**Parameters:**
- `initialState`: Initial state for the mixin
- `reducer`: Optional reducer function for state updates

**Returns:** Stateful mixin

**Example:**
```typescript
const counterMixin = createStatefulMixin(
  { count: 0 },
  (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      case 'DECREMENT':
        return { ...state, count: state.count - 1 };
      default:
        return state;
    }
  }
);
```

### applyMixins

Applies mixins to a base state and returns combined configuration.

```typescript
function applyMixins<T, M extends Record<string, Mixin>>(
  baseState: T,
  mixins: M
): {
  initialState: MixedState<T, M>;
  lifecycle: MixinLifecycle<MixedState<T, M>>;
  computed: Record<string, (state: MixedState<T, M>) => any>;
  methods: Record<string, (state: MixedState<T, M>, dispatch: Dispatch<any>, ...args: any[]) => any>;
  handlers: Record<string, (state: MixedState<T, M>, dispatch: Dispatch<any>, event: any) => void>;
}
```

**Parameters:**
- `baseState`: Base component state
- `mixins`: Mixins to apply

**Returns:** Combined mixin configuration

## Lifecycle Methods

Mixins can hook into component lifecycle events:

### created

Called when the component is first created.

```typescript
lifecycle: {
  created: (state, dispatch) => {
    // Initialize resources, set up subscriptions, etc.
    console.log('Component created with state:', state);
  }
}
```

### beforeRender

Called before each render cycle.

```typescript
lifecycle: {
  beforeRender: (state, dispatch) => {
    // Prepare data for rendering
    if (state.data.length === 0) {
      dispatch({ type: 'FETCH_DATA' });
    }
  }
}
```

### afterRender

Called after each render cycle.

```typescript
lifecycle: {
  afterRender: (state, vnode) => {
    // Access the rendered virtual DOM
    console.log('Rendered element:', vnode);
  }
}
```

### destroyed

Called when the component is destroyed.

```typescript
lifecycle: {
  destroyed: (state, dispatch) => {
    // Clean up resources, cancel subscriptions, etc.
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }
  }
}
```

## State Management

### Initial State

Mixins can provide initial state that gets merged with component state:

```typescript
const timerMixin = createMixin({
  initialState: {
    startTime: null,
    elapsed: 0
  }
});

const MyComponent = createComponent({
  initialState: { message: 'Hello' },
  mixins: {
    timer: timerMixin
  },
  // Component state will be:
  // { message: 'Hello', timer: { startTime: null, elapsed: 0 } }
});
```

### State Merging

By default, mixin state is nested under the mixin name. You can customize this with `mergeState`:

```typescript
const flatMixin = createMixin({
  initialState: { count: 0 },
  mergeState: (baseState, mixinState) => ({
    ...baseState,
    ...mixinState  // Flatten the state
  })
});
```

## Computed Properties

Mixins can provide computed properties that are recalculated when dependencies change:

```typescript
const statsMixin = createMixin({
  computed: {
    total: (state) => state.items.reduce((sum, item) => sum + item.value, 0),
    average: (state) => state.items.length > 0 ? state.total / state.items.length : 0
  }
});
```

## Methods

Mixins can provide reusable methods:

```typescript
const apiMixin = createMixin({
  methods: {
    fetchData: async (state, dispatch) => {
      try {
        const data = await fetch('/api/data').then(r => r.json());
        dispatch({ type: 'DATA_LOADED', data });
      } catch (error) {
        dispatch({ type: 'DATA_ERROR', error });
      }
    },

    saveData: (state, dispatch, data) => {
      dispatch({ type: 'SAVE_STARTED' });
      // Save logic...
    }
  }
});
```

## Event Handlers

Mixins can provide common event handlers:

```typescript
const formMixin = createMixin({
  handlers: {
    onInput: (state, dispatch, event) => {
      const { name, value } = event.target;
      dispatch({ type: 'FIELD_UPDATED', field: name, value });
    },

    onSubmit: (state, dispatch, event) => {
      event.preventDefault();
      dispatch({ type: 'FORM_SUBMITTED', data: state.formData });
    }
  }
});
```

## Usage Examples

### Counter with Logging

```typescript
const CounterComponent = createComponent({
  displayName: 'Counter',
  initialState: { displayValue: 0 },

  mixins: {
    counter: createStatefulMixin(
      { count: 0 },
      (state, action) => {
        switch (action.type) {
          case 'INCREMENT': return { ...state, count: state.count + 1 };
          case 'DECREMENT': return { ...state, count: state.count - 1 };
          default: return state;
        }
      }
    ),

    logger: createMixin({
      initialState: {},
      lifecycle: {
        created: (state) => console.log('Counter created'),
        beforeRender: (state) => console.log('Rendering counter:', state),
        destroyed: (state) => console.log('Counter destroyed')
      }
    }
  },

  model: (state, action) => {
    // Sync display value with counter
    if (action.type === 'INCREMENT' || action.type === 'DECREMENT') {
      return { ...state, displayValue: state.counter.count };
    }
    return state;
  },

  view: (state) => createElement('div', { className: 'counter' },
    createElement('span', {}, state.displayValue),
    createElement('button', {
      onClick: () => ({ type: 'INCREMENT' })
    }, '+'),
    createElement('button', {
      onClick: () => ({ type: 'DECREMENT' })
    }, '-')
  )
});
```

### Timer with Persistence

```typescript
const TimerComponent = createComponent({
  displayName: 'Timer',
  initialState: { time: 0 },

  mixins: {
    timer: createMixin({
      initialState: { intervalId: null },
      methods: {
        startTimer: (state, dispatch) => {
          if (state.timer.intervalId) return state;

          const intervalId = setInterval(() => {
            dispatch({ type: 'TICK' });
          }, 1000);

          return { ...state, timer: { ...state.timer, intervalId } };
        },

        stopTimer: (state, dispatch) => {
          if (state.timer.intervalId) {
            clearInterval(state.timer.intervalId);
          }
          return { ...state, timer: { ...state.timer, intervalId: null } };
        }
      },

      lifecycle: {
        destroyed: (state) => {
          if (state.timer.intervalId) {
            clearInterval(state.timer.intervalId);
          }
        }
      }
    }),

    persistence: createMixin({
      lifecycle: {
        created: (state) => {
          // Load saved time from localStorage
          const saved = localStorage.getItem('timer-time');
          if (saved) {
            return { ...state, time: parseInt(saved, 10) };
          }
        },

        beforeRender: (state) => {
          // Save time to localStorage
          localStorage.setItem('timer-time', state.time.toString());
        }
      }
    })
  },

  model: (state, action) => {
    switch (action.type) {
      case 'TICK':
        return { ...state, time: state.time + 1 };
      case 'START_TIMER':
        return state.mixins.timer.methods.startTimer(state, () => {});
      case 'STOP_TIMER':
        return state.mixins.timer.methods.stopTimer(state, () => {});
      default:
        return state;
    }
  },

  view: (state) => createElement('div', { className: 'timer' },
    createElement('h2', {}, `Time: ${state.time}s`),
    createElement('button', {
      onClick: () => ({ type: state.mixins.timer.state.intervalId ? 'STOP_TIMER' : 'START_TIMER' })
    }, state.mixins.timer.state.intervalId ? 'Stop' : 'Start')
  )
});
```

## Best Practices

### Keep Mixins Focused

Each mixin should have a single responsibility:

```typescript
// Good - single responsibility
const counterMixin = createMixin({ /* counter logic only */ });
const loggingMixin = createMixin({ /* logging logic only */ });

// Bad - multiple responsibilities
const counterLoggingMixin = createMixin({
  // Both counter and logging logic
});
```

### Use Composition Over Inheritance

Combine mixins rather than creating deep inheritance hierarchies:

```typescript
// Good
mixins: {
  counter: counterMixin,
  logger: loggingMixin,
  persistence: persistenceMixin
}

// Bad
class CounterComponent extends LoggingComponent {
  // Inheritance can lead to tight coupling
}
```

### Handle State Conflicts

Be careful about naming conflicts between mixins:

```typescript
// Use namespaces or prefixes to avoid conflicts
const userMixin = createMixin({
  initialState: { user_name: '', user_email: '' }
});

const profileMixin = createMixin({
  initialState: { profile_name: '', profile_avatar: '' }
});
```

### Test Mixins in Isolation

Test each mixin independently:

```typescript
describe('Counter Mixin', () => {
  it('should increment counter', () => {
    const mixin = counterMixin;
    // Test mixin logic in isolation
  });
});
```

## Performance Considerations

- Mixin state is merged at component creation time
- Lifecycle methods are combined into single functions
- Avoid expensive computations in lifecycle methods
- Use computed properties for derived state
