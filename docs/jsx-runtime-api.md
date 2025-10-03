# JSX Runtime API Documentation

## Overview

The JSX Runtime provides the core functions that power JSX/TSX syntax in the Marabutan framework. It includes factory functions that transform JSX into Virtual DOM nodes, along with the Fragment component for grouping elements without wrapper DOM nodes.

## Core Functions

### jsx

The primary JSX factory function that creates Virtual DOM elements from JSX syntax.

```typescript
function jsx(
  type: string | Function | symbol,
  props: Record<string, any> | null,
  key?: string | number
): VNode
```

**Parameters:**
- `type`: Element type (HTML tag name, component function, or Fragment symbol)
- `props`: Element properties and attributes (can be null)
- `key`: Optional key for list reconciliation

**Returns:** A Virtual DOM node

**Example:**
```typescript
import { jsx } from './jsx-runtime';

// Manual JSX calls (normally done by the compiler)
const element = jsx('div', { className: 'container' }, 'Hello World');

// With children
const withChildren = jsx('div', { className: 'wrapper' },
  jsx('h1', {}, 'Title'),
  jsx('p', {}, 'Content')
);

// With key
const keyedElement = jsx('li', { className: 'item' }, 'item-1');
keyedElement.key = 'item-1';
```

### jsxDEV

Development version of the JSX factory function with additional debugging capabilities.

```typescript
function jsxDEV(
  type: string | Function | symbol,
  props: Record<string, any> | null,
  key?: string | number,
  __source?: any,
  __self?: any
): VNode
```

**Parameters:**
- `type`: Element type (same as jsx)
- `props`: Element properties (same as jsx)
- `key`: Optional key for list reconciliation
- `__source`: Source location information for debugging
- `__self`: Reference to the component instance

**Returns:** A Virtual DOM node

**Note:** In production builds, jsxDEV typically calls jsx internally for performance.

### jsxs

Optimized JSX factory function for elements with static children arrays.

```typescript
function jsxs(
  type: string | Function | symbol,
  props: Record<string, any> | null,
  key?: string | number
): VNode
```

**Parameters:** Same as `jsx`

**Returns:** A Virtual DOM node

**Note:** jsxs is used by the JSX compiler when it can determine that children are static. It has the same implementation as jsx in this runtime but provides a semantic distinction.

## Fragment

A special symbol used for grouping multiple children without creating a wrapper DOM element.

```typescript
const Fragment: unique symbol
```

**Example:**
```typescript
import { Fragment, jsx } from './jsx-runtime';

// Grouping children without wrapper
const listItems = jsx(Fragment, {},
  jsx('li', { key: '1' }, 'Item 1'),
  jsx('li', { key: '2' }, 'Item 2'),
  jsx('li', { key: '3' }, 'Item 3')
);

// In JSX syntax (compiled to above)
const listItemsJSX = (
  <>
    <li key="1">Item 1</li>
    <li key="2">Item 2</li>
    <li key="3">Item 3</li>
  </>
);
```

## TypeScript Configuration

### tsconfig.json

Configure TypeScript to use the correct JSX runtime:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "./src",
    "lib": ["DOM", "ES2020"],
    "moduleResolution": "node",
    "target": "ES2020",
    "strict": true
  }
}
```

### Vite Configuration

Configure Vite for automatic JSX transformation:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: './src',
  },
});
```

## JSX Syntax Support

### Basic Elements

```tsx
import './jsx-runtime'; // Imported automatically by JSX compiler

// HTML elements
const div = <div>Hello World</div>;

// Self-closing elements
const input = <input type="text" />;

// Custom components
const MyComponent = ({ title }) => <h1>{title}</h1>;
const usage = <MyComponent title="Hello" />;
```

### Element Properties

```tsx
// String literals
const element1 = <div className="container">Content</div>;

// JavaScript expressions
const className = 'active';
const element2 = <div className={className}>Content</div>;

// Mixed properties
const element3 = <input
  type="text"
  placeholder="Enter text"
  disabled={false}
  onChange={(e) => console.log(e)}
/>;
```

### Children

```tsx
// Text children
const textChild = <span>Hello</span>;

// Element children
const elementChild = <div><span>Nested</span></div>;

// Multiple children
const multiple = <ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>;

// Expression children
const dynamic = <div>{Math.random() > 0.5 ? 'High' : 'Low'}</div>;
```

### Keys for Lists

```tsx
const items = ['Apple', 'Banana', 'Cherry'];

const list = <ul>
  {items.map(item => <li key={item}>{item}</li>)}
</ul>;
```

## Usage Examples

### Basic JSX Usage

```tsx
import { jsx, Fragment } from './jsx-runtime';

// Manual JSX calls (normally handled by compiler)
function createApp() {
  return jsx('div', { className: 'app' },
    jsx('header', { className: 'header' },
      jsx('h1', {}, 'My App')
    ),
    jsx('main', { className: 'main' },
      jsx('p', {}, 'Welcome to the app!')
    )
  );
}

// Using JSX syntax (compiled to above)
function createAppJSX() {
  return (
    <div className="app">
      <header className="header">
        <h1>My App</h1>
      </header>
      <main className="main">
        <p>Welcome to the app!</p>
      </main>
    </div>
  );
}
```

### Component with JSX

```tsx
import { jsx } from './jsx-runtime';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  return jsx('button', {
    className: `btn btn-${variant}`,
    onClick
  }, label);
}

// Using JSX syntax
const PrimaryButton = ({ label, onClick }) => (
  <button className={`btn btn-primary`} onClick={onClick}>
    {label}
  </button>
);
```

### Fragment Usage

```tsx
import { Fragment, jsx } from './jsx-runtime';

// Manual Fragment usage
function ListItems({ items }) {
  return jsx(Fragment, {},
    ...items.map(item =>
      jsx('li', { key: item.id }, item.text)
    )
  );
}

// JSX Fragment syntax
function ListItemsJSX({ items }) {
  return (
    <>
      {items.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </>
  );
}

// Common pattern: conditional rendering without wrapper
function ConditionalContent({ showExtra, children }) {
  return jsx(Fragment, {},
    children,
    showExtra && jsx('div', { className: 'extra' }, 'Extra content')
  );
}
```

### Complex Component with Mixed Content

```tsx
import { jsx, Fragment } from './jsx-runtime';

interface CardProps {
  title: string;
  content: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated';
}

function Card({ title, content, actions, variant = 'default' }: CardProps) {
  const className = `card card-${variant}`;

  return jsx('div', { className },
    jsx('div', { className: 'card-header' },
      jsx('h2', { className: 'card-title' }, title)
    ),
    jsx('div', { className: 'card-content' }, content),
    actions && jsx('div', { className: 'card-actions' }, actions)
  );
}

// JSX version
const CardJSX = ({ title, content, actions, variant = 'default' }) => {
  const className = `card card-${variant}`;

  return (
    <div className={className}>
      <div className="card-header">
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-content">{content}</div>
      {actions && <div className="card-actions">{actions}</div>}
    </div>
  );
};
```

## Integration with Framework Systems

### With Virtual DOM

JSX runtime automatically creates Virtual DOM nodes:

```tsx
import { jsx } from './jsx-runtime';
import { diff, patch } from './vdom';

// JSX creates VNodes
const oldElement = <div>Hello</div>;
const newElement = <div>Hello World</div>;

// Use with diff/patch
const patches = diff(oldElement, newElement);
patch(document.body, patches);
```

### With Components

```tsx
import { createComponent } from './components/core';
import { jsx } from './jsx-runtime';

const TodoItem = createComponent({
  displayName: 'TodoItem',
  initialState: { completed: false },

  view: (state, props) => jsx('li', {
    className: state.completed ? 'completed' : '',
    onClick: () => ({ type: 'TOGGLE' })
  }, props.text)
});

// JSX in component views
const TodoList = createComponent({
  view: (state) => (
    <ul className="todo-list">
      {state.todos.map(todo => (
        <TodoItem key={todo.id} text={todo.text} />
      ))}
    </ul>
  )
});
```

### With MVI Architecture

```tsx
import { run } from './mvi/core';
import { jsx } from './jsx-runtime';

const counterApp = {
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

  view: (state, dispatch) => jsx('div', { className: 'counter' },
    jsx('h1', {}, `Count: ${state.count}`),
    jsx('button', { onClick: () => dispatch({ type: 'INCREMENT' }) }, '+'),
    jsx('button', { onClick: () => dispatch({ type: 'DECREMENT' }) }, '-')
  ),

  rootElement: '#app'
};

run(counterApp);
```

## Performance Considerations

### Production Optimization

- `jsxDEV` calls are automatically replaced with `jsx` in production builds
- Fragment operations are optimized to avoid unnecessary wrapper elements
- Key handling is optimized for list reconciliation

### Bundle Size

- Tree-shaking removes unused JSX functions from production bundles
- Fragment symbol has minimal runtime overhead
- JSX transform happens at compile time, not runtime

### Runtime Performance

- Direct Virtual DOM node creation (no intermediate representations)
- Efficient children handling with spread operator optimization
- Minimal function call overhead

## Best Practices

### 1. Use JSX Syntax Over Manual Calls

```tsx
// Preferred - JSX syntax
const element = <div className="container">Hello</div>;

// Avoid - manual jsx calls (unless necessary)
const element = jsx('div', { className: 'container' }, 'Hello');
```

### 2. Provide Keys for Dynamic Lists

```tsx
// Good - keys help with efficient updates
const list = (
  <ul>
    {items.map(item => <li key={item.id}>{item.name}</li>)}
  </ul>
);

// Avoid - missing keys cause inefficient updates
const badList = (
  <ul>
    {items.map(item => <li>{item.name}</li>)}
  </ul>
);
```

### 3. Use Fragment for Grouping

```tsx
// Good - Fragment groups without wrapper
function TableRows({ rows }) {
  return (
    <>
      {rows.map(row => <tr key={row.id}>{/* row cells */}</tr>)}
    </>
  );
}

// Avoid - unnecessary wrapper div
function BadTableRows({ rows }) {
  return (
    <div>
      {rows.map(row => <tr key={row.id}>{/* row cells */}</tr>)}
    </div>
  );
}
```

### 4. Optimize Component Renders

```tsx
// Good - extract static JSX to constants
const Icon = <span className="icon">★</span>;

function StarRating({ rating }) {
  return (
    <div className="rating">
      {Array.from({ length: rating }, (_, i) => (
        <span key={i} className="star">★</span>
      ))}
    </div>
  );
}
```

### 5. Type Safety

```tsx
// Good - use TypeScript interfaces
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  children: string;
}

const Button: FunctionComponent<ButtonProps> = ({ variant, size, children }) => (
  <button className={`btn ${variant} ${size}`}>
    {children}
  </button>
);
```

## Error Handling

The JSX runtime is designed to be robust:

```typescript
// Safe to call with various inputs
jsx(null, {});           // Handles null types gracefully
jsx('div', null);        // Handles null props
jsx('div', undefined);   // Handles undefined props

// Fragment is always safe
jsx(Fragment, null);     // Works correctly
```

## Migration from Other Frameworks

### From React

```tsx
// React JSX (compatible)
const element = <div className="container">Hello</div>;

// React Fragment syntax works
const items = (
  <>
    <li>Item 1</li>
    <li>Item 2</li>
  </>
);
```

### From Vue Templates

```tsx
// Vue template equivalent
const template = `
  <div class="user">
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
  </div>
`;

// Marabutan JSX equivalent
const UserCard = ({ user }) => (
  <div className="user">
    <h1>{user.name}</h1>
    <p>{user.email}</p>
  </div>
);
```

### From Manual DOM Creation

```javascript
// Manual DOM creation
const div = document.createElement('div');
div.className = 'container';
div.textContent = 'Hello';
container.appendChild(div);

// JSX equivalent
const element = <div className="container">Hello</div>;
// Automatically creates Virtual DOM node
```

This JSX runtime provides a modern, type-safe way to create user interfaces while maintaining excellent performance and developer experience.
