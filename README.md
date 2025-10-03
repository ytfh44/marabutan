# MVI Frontend Framework

A modern JavaScript frontend framework built with TypeScript, featuring MVI (Model-View-Intent) architecture, virtual DOM, and a powerful mixins system.

## Features

- **MVI Architecture**: Unidirectional data flow with clear separation of concerns
- **Virtual DOM**: Efficient DOM updates with double-ended diff algorithm
- **Mixins System**: Reusable component logic and state management
- **JSX/TSX Support**: Full React-compatible JSX syntax with Function Components
- **Template System**: String-based templating with interpolation and filters
- **TypeScript**: Full type safety with comprehensive type definitions
- **Component System**: Modular, reusable UI components with lifecycle management
- **Performance Optimized**: 
  - Batch update scheduler (significantly reduces render frequency)
  - Shallow equality props comparison (much faster than JSON serialization)
  - Double-ended diff algorithm (notably reduces DOM operations)
  - Component memoization API
  - Automatic memory cleanup
- **Developer Experience**: Development warnings, error handling, and debugging support
- **Vitest Integration**: Comprehensive testing support out of the box

## Architecture

### MVI Pattern

The framework follows the Model-View-Intent pattern:

- **Model**: Pure functions that update application state based on actions
- **View**: Functions that render state to virtual DOM nodes
- **Intent**: Functions that handle user interactions and dispatch actions

### Virtual DOM

The virtual DOM system provides efficient DOM updates through:

- Virtual node creation and management
- Diffing algorithm to detect changes
- Patch application for minimal DOM updates

### Mixins

Mixins allow you to share logic and state across components:

- State management mixins
- Lifecycle mixins
- Event handling mixins
- Custom behavior mixins

## Quick Start

### Installation

```bash
npm create vite@latest my-app -- --template typescript
cd my-app
npm install
npm install --save-dev vitest @types/node jsdom
```

### Basic Usage

#### Using JSX/TSX Syntax

```typescript
import { run } from './mvi/core';
import { Fragment } from './jsx-runtime';

// Define your MVI application with JSX
const app = {
  initialState: { count: 0 },

  intent: (dispatch) => ({
    increment: () => dispatch({ type: 'INCREMENT' }),
    decrement: () => dispatch({ type: 'DECREMENT' })
  }),

  model: (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      case 'DECREMENT':
        return { ...state, count: state.count - 1 };
      default:
        return state;
    }
  },

  view: (state) => (
    <div className="counter">
      <h1>Count: {state.count}</h1>
      <button onClick={() => ({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => ({ type: 'DECREMENT' })}>-</button>
    </div>
  ),

  rootElement: '#app'
};

// Run the application
run(app);
```

#### Using Template System

```typescript
import { template, defaultFilters } from './template';

const user = {
  name: 'John Doe',
  age: 30,
  city: 'New York'
};

// Render template with data
const result = template(`
  <div class="user-profile">
    <h2>{{ user.name }}</h2>
    <p>Age: {{ user.age }}</p>
    <p>City: {{ user.city | uppercase }}</p>
  </div>
`, { user }, { filters: defaultFilters });
```

#### Mixed JSX and Templates

```typescript
import { template } from './template';

// Template for data display
const statsTemplate = template(`
  <div class="stats">
    <div class="stat">Users: {{ count }}</div>
  </div>
`, { count: 42 });

// JSX for interactive components
const component = (
  <div className="dashboard">
    <h1>Dashboard</h1>
    <button onClick={() => refresh()}>Refresh</button>
    <div className="content">
      {statsTemplate}
    </div>
  </div>
);
```

### Using Components and Mixins

```typescript
import { createComponent } from './components/core';
import { counterMixin, loggingMixin } from './examples/mixins';

const CounterComponent = createComponent({
  displayName: 'Counter',
  initialState: { displayValue: 0 },

  mixins: {
    counter: counterMixin,
    logger: loggingMixin
  },

  model: (state, action) => {
    // Handle actions and update display value
    if (action.type === 'INCREMENT') {
      const newCounter = { ...state.counter, count: state.counter.count + 1 };
      return { ...state, counter: newCounter, displayValue: newCounter.count };
    }
    return state;
  },

  view: (state) => createElement('div', { className: 'counter' },
    createElement('h2', {}, 'Counter: ', state.displayValue),
    createElement('button', {
      onClick: () => ({ type: 'INCREMENT' })
    }, '+')
  )
});

// Use the component
const counter = CounterComponent();
```

## JSX/TSX Support

### JSX Runtime

The framework provides a comprehensive JSX/TSX runtime with full React-compatible syntax:

```typescript
import { jsx, Fragment } from './jsx-runtime';

// JSX is automatically transformed to jsx() calls
const element = (
  <div className="container">
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// Fragment for grouping without wrapper
const fragment = (
  <Fragment>
    <div>Item 1</div>
    <div>Item 2</div>
  </Fragment>
);
```

### Function Components

Create reusable components with function components:

```typescript
import { FunctionComponent } from './jsx.d';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: FunctionComponent<ButtonProps> = ({ label, onClick }) => (
  <button className="btn" onClick={onClick}>
    {label}
  </button>
);
```

### Key Features

- ✅ **Full JSX/TSX syntax support**
- ✅ **Function components** with TypeScript support
- ✅ **Fragment support** for grouping elements
- ✅ **Key-based reconciliation** for efficient list rendering
- ✅ **Event handler optimization** (automatic deduplication)
- ✅ **SVG support** with proper type definitions
- ✅ **Development warnings** for missing keys and performance issues
- ✅ **React-compatible API** for easy migration

### JSX Configuration

TypeScript and Vite are configured to handle JSX/TSX files automatically:

```typescript
// tsconfig.json includes:
{
  "jsx": "react-jsx",
  "jsxImportSource": "./src"
}

// vite.config.ts includes:
{
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: './src',
  }
}
```

### For More Details

See the [JSX/TSX Usage Guide](./docs/jsx-tsx-guide.md) for comprehensive documentation and examples.

## Template System

### Basic Templates

```typescript
import { template, defaultFilters } from './template';

const user = {
  name: 'John',
  age: 30,
  items: ['apple', 'banana', 'cherry']
};

// Simple interpolation
const result = template(`
  <div class="user">
    <h2>{{ user.name }}</h2>
    <p>Age: {{ user.age }}</p>
    <p>Items: {{ user.items | length }}</p>
  </div>
`, { user }, { filters: defaultFilters });
```

### Advanced Templates

```typescript
// Template with conditionals and loops
const advancedTemplate = template(`
  <div class="list">
    <h1>{{ title | uppercase }}</h1>
    <ul>
      <li class="item" *for="item in items">
        {{ item.name | capitalize }}
      </li>
    </ul>
  </div>
`, {
  title: 'Product List',
  items: [
    { name: 'laptop' },
    { name: 'mouse' }
  ]
});
```

### Custom Filters

```typescript
const customFilters = {
  ...defaultFilters,
  currency: (value: number) => `$${value.toFixed(2)}`,
  formatDate: (date: Date) => date.toLocaleDateString()
};

const result = template(`
  <div>
    <p>Price: {{ price | currency }}</p>
    <p>Date: {{ createdAt | formatDate }}</p>
  </div>
`, data, { filters: customFilters });
```

## API Reference

### JSX Runtime

#### `jsx(type, props?, key?)`

The JSX factory function used internally by the JSX compiler.

#### `Fragment`

React-style Fragment component for grouping children without a wrapper element.

### Template System

#### `template(templateString, context?, options?)`

Renders a template string with the provided context and options.

```typescript
interface TemplateOptions {
  context?: TemplateContext;
  components?: Record<string, Function>;
  filters?: Record<string, Function>;
}
```

#### `TemplateEngine`

Class-based template engine for more advanced usage:

```typescript
const engine = new TemplateEngine({
  context: { user: { name: 'John' } },
  filters: { uppercase: (str) => str.toUpperCase() }
});

const result = engine.render('<h1>{{ user.name | uppercase }}</h1>');
```

### Virtual DOM

#### `createElement(type, props?, ...children)`

Creates a virtual DOM node.

```typescript
const vnode = createElement('div', { className: 'container' },
  createElement('h1', {}, 'Title'),
  createElement('p', {}, 'Content')
);
```

#### `createVNode(type, props?, children?)`

Lower-level function to create virtual nodes.

#### `diff(oldVNode, newVNode)`

Compares two virtual DOM trees and generates patches.

#### `patch(parent, patches)`

Applies patches to the actual DOM.

### MVI Architecture

#### `run(app)`

Runs an MVI application.

```typescript
interface MVIApp<T, A> {
  initialState: T;
  intent: Intent<A>;
  model: Model<T, A>;
  view: View<T>;
  rootElement: Element | string;
}

const control = run(app);
// control.dispatch(action)
// control.getState()
// control.stop()
```

### Mixins

#### `createMixin(definition)`

Creates a mixin definition.

```typescript
const myMixin = createMixin({
  initialState: { value: 0 },
  lifecycle: {
    created: (state, dispatch) => {
      console.log('Component created');
    }
  },
  methods: {
    increment: (state, dispatch) => {
      dispatch({ type: 'INCREMENT' });
    }
  }
});
```

#### `applyMixins(baseState, mixins)`

Applies mixins to a base state.

### Components

#### `createComponent(definition)`

Creates a component factory.

```typescript
interface ComponentDefinition<T, P = {}> {
  initialState: T;
  props?: P;
  mixins?: Record<string, Mixin>;
  model?: Model<T, any>;
  view: View<T>;
  lifecycle?: MixinLifecycle<T>;
}

const MyComponent = createComponent({
  initialState: { count: 0 },
  view: (state) => createElement('div', {}, state.count.toString())
});
```

## Examples

See the [Framework Integration Guide](./docs/integration-guide.md) for comprehensive examples showing all systems working together, including:

- Counter component with mixins
- Timer component with lifecycle management
- Todo list with state persistence
- Component composition patterns
- Real-time WebSocket applications
- E-commerce dashboard with all systems integrated

### Context API Examples

The framework includes complete Context API integration examples:

- **Theme Context**: Theme switching (light/dark mode)
- **Auth Context**: User authentication and authorization
- **Counter Context**: Global state with mixins integration
- **MVI Integration**: Context usage in MVI architecture
- **Todo App**: Complete todo application with Context + MVI

Run examples:
```typescript
import {
  runMultiContextExample,
  runContextMVIExample,
  runTodoExample,
  runThemeExample,
  runAuthExample,
  runCounterExample,
  listExamples
} from './examples';

// List all available examples
listExamples();

// Run a specific example
runTodoExample();
```

Additional examples are available in the `src/examples/` directory.

## Testing

The framework includes comprehensive tests using Vitest:

```bash
npm test              # Run all tests
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage
```

## Project Structure

```
src/
├── vdom/           # Virtual DOM implementation
│   ├── types.ts    # Type definitions
│   ├── vnode.ts    # Virtual node creation
│   ├── createElement.ts  # JSX-like element creation
│   ├── diff.ts     # Diffing algorithm
│   └── patch.ts    # DOM patching
├── mvi/            # MVI architecture
│   ├── types.ts    # Type definitions
│   └── core.ts     # Core MVI implementation
├── mixins/         # Mixins system
│   ├── types.ts    # Type definitions
│   └── core.ts     # Mixin application logic
├── components/     # Component system
│   ├── types.ts    # Type definitions
│   └── core.ts     # Component creation and management
└── examples/       # Usage examples and demos
    ├── mixins.ts   # Example mixins
    ├── components.ts # Example components
    └── index.ts    # Main example entry point
```

## Development

### Building

```bash
npm run build  # Build for production
npm run dev    # Start development server
```

### Contributing

1. Follow TypeScript strict mode guidelines
2. Add tests for new features
3. Update documentation for API changes
4. Use meaningful commit messages

## License

MIT License - see LICENSE file for details.

## Documentation

- [JSX/TSX Usage Guide](./docs/jsx-tsx-guide.md) - Complete guide to JSX syntax and features
- [JSX Runtime API](./docs/jsx-runtime-api.md) - Production JSX runtime functions
- [JSX Development Runtime](./docs/jsx-dev-runtime.md) - Development-time JSX features
- [MVI Architecture API](./docs/mvi-api.md) - Model-View-Intent pattern implementation
- [Virtual DOM API](./docs/vdom-api.md) - Virtual DOM diffing and patching
- [Components API](./docs/components-api.md) - Component system with lifecycle management
- [Mixins API](./docs/mixins-api.md) - Reusable component logic and state management
- [Context API](./docs/context-api.md) - Context management for component tree data sharing
- [Template System API](./docs/template-api.md) - String-based templating with interpolation
- [Utils and Warnings API](./docs/utils-api.md) - Development utilities and validation
- [Framework Integration Guide](./docs/integration-guide.md) - Complete examples showing all systems working together

## Performance

Marabutan includes several automatic performance optimizations:

- **Batch Updates**: Multiple dispatches are automatically batched into a single render
- **Smart Diffing**: Double-ended algorithm optimizes list updates
- **Shallow Comparison**: Fast props comparison without JSON serialization
- **Memo API**: React.memo-style component memoization
- **Memory Safety**: Automatic cleanup prevents memory leaks

See [Performance Guide](./docs/performance-guide.md) for best practices and benchmarks.

## Roadmap

- [x] JSX/TSX support
- [x] Context API
- [x] Performance optimizations (batch updates, memo, optimized diff)
- [ ] Hooks API for functional components
- [ ] Server-side rendering support
- [ ] Component lazy loading
- [ ] Developer tools and DevTools integration
