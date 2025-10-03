# JSX/TSX Usage Guide

## Overview

The Marabutan framework provides complete JSX/TSX support, allowing you to build user interfaces using familiar JSX syntax.

## Basic Usage

### Simple Elements

```tsx
import { createElement } from './vdom/createElement';

// Basic element
const element = <div>Hello World</div>;

// Element with attributes
const styledElement = <div className="container" id="main">Content</div>;

// Self-closing element
const input = <input type="text" placeholder="Enter text" />;
```

### Nested Elements

```tsx
const nestedElement = (
  <div className="container">
    <h1>Title</h1>
    <p>This is a paragraph</p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </div>
);
```

### JavaScript Expressions

```tsx
const name = 'World';
const count = 42;

const element = (
  <div>
    <h1>Hello {name}!</h1>
    <p>Count: {count}</p>
    <p>Double: {count * 2}</p>
  </div>
);
```

## Fragment Support

Use Fragment to group multiple children without adding extra DOM nodes:

```tsx
import { Fragment } from './jsx-runtime';

const list = (
  <Fragment>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </Fragment>
);
```

Or use short syntax (requires configuration):

```tsx
const list = (
  <>
    <li>Item 1</li>
    <li>Item 2</li>
  </>
);
```

## Function Components

### Basic Function Component

```tsx
import { FunctionComponent } from './jsx.d';
import type { VNode } from './vdom/types';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: FunctionComponent<ButtonProps> = (props) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className="btn"
    >
      {props.label}
    </button>
  );
};

// Usage
const app = <Button label="Click me" onClick={() => console.log('Clicked!')} />;
```

### Component with Children

```tsx
interface CardProps {
  title: string;
  children?: VNode | VNode[];
}

const Card: FunctionComponent<CardProps> = ({ title, children }) => {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

// Usage
const myCard = (
  <Card title="My Card">
    <p>Card content here</p>
    <button>Action</button>
  </Card>
);
```

## Lists and Keys

Provide unique `key` props for each item in lists to optimize rendering performance:

```tsx
const items = ['Apple', 'Banana', 'Cherry'];

const list = (
  <ul>
    {items.map(item => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);
```

**Important**: Missing keys will trigger warnings in development mode.

## Conditional Rendering

### Using && Operator

```tsx
const isLoggedIn = true;

const element = (
  <div>
    {isLoggedIn && <p>Welcome back!</p>}
    {!isLoggedIn && <p>Please log in</p>}
  </div>
);
```

### Using Ternary Operator

```tsx
const status = loading ? (
  <div>Loading...</div>
) : (
  <div>Content loaded</div>
);
```

## Event Handling

### Basic Event Handling

```tsx
const handleClick = (event: MouseEvent) => {
  console.log('Button clicked!', event);
};

const button = <button onClick={handleClick}>Click me</button>;
```

### Inline Event Handlers

```tsx
const button = (
  <button onClick={() => console.log('Clicked!')}>
    Click me
  </button>
);
```

### Event Types

Supported events include:

- `onClick`, `onDoubleClick`
- `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`
- `onKeyDown`, `onKeyUp`, `onKeyPress`
- `onChange`, `onInput`, `onSubmit`
- `onFocus`, `onBlur`

## Style Handling

### className

```tsx
const element = <div className="container primary">Content</div>;
```

### Inline Style Object

```tsx
const styles = {
  color: 'red',
  fontSize: '16px',
  fontWeight: 'bold'
};

const element = <div style={styles}>Styled content</div>;
```

### Inline Style Direct Assignment

```tsx
const element = (
  <div style={{ color: 'blue', padding: '10px' }}>
    Styled content
  </div>
);
```

## Form Elements

### Input Field

```tsx
const input = (
  <input
    type="text"
    value={value}
    onChange={(e: InputEvent) => setValue((e.target as HTMLInputElement).value)}
    placeholder="Enter text"
  />
);
```

### Checkbox

```tsx
const checkbox = (
  <input
    type="checkbox"
    checked={isChecked}
    onChange={() => setIsChecked(!isChecked)}
  />
);
```

### Select Dropdown

```tsx
const select = (
  <select value={selectedValue} onChange={handleChange}>
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
    <option value="option3">Option 3</option>
  </select>
);
```

## Special Attributes

### Data Attributes

```tsx
const element = (
  <div
    data-testid="my-element"
    data-value="123"
  >
    Content
  </div>
);
```

### ARIA Attributes

```tsx
const button = (
  <button
    aria-label="Close"
    aria-pressed="false"
    onClick={handleClose}
  >
    ×
  </button>
);
```

## SVG Support

```tsx
const icon = (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="blue" />
    <path d="M12 2 L12 22" stroke="white" strokeWidth="2" />
  </svg>
);
```

## Integration with MVI Architecture

```tsx
import { createComponent } from './components/core';

const Counter = createComponent({
  displayName: 'Counter',
  initialState: { count: 0 },

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

  view: (state, dispatch) => (
    <div className="counter">
      <h2>Count: {state.count}</h2>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
    </div>
  )
});
```

## Development Mode Warnings

The framework provides helpful warnings in development mode:

### Missing Key Warnings

```tsx
// ⚠️ Warning: List items missing keys
const badList = (
  <ul>
    {items.map(item => <li>{item}</li>)}
  </ul>
);

// ✅ Correct: Provide keys
const goodList = (
  <ul>
    {items.map((item, index) => <li key={index}>{item}</li>)}
  </ul>
);
```

### Performance Warnings

The framework warns about deeply nested component trees (over 50 levels) or other potential performance issues.

## Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "./src"
  }
}
```

### vite.config.ts

```typescript
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: './src',
  },
});
```

## Best Practices

1. **Always provide keys for list items**
   ```tsx
   {items.map(item => <Item key={item.id} data={item} />)}
   ```

2. **Use Function Components for simplicity**
   ```tsx
   const Greeting = ({ name }) => <h1>Hello {name}!</h1>;
   ```

3. **Extract reusable components**
   ```tsx
   const Button = ({ label, onClick }) => (
     <button className="btn" onClick={onClick}>{label}</button>
   );
   ```

4. **Use Fragment to avoid unnecessary wrapper elements**
   ```tsx
   return (
     <Fragment>
       <Header />
       <Content />
       <Footer />
     </Fragment>
   );
   ```

5. **Use conditional rendering appropriately**
   ```tsx
   {condition && <Component />}
   {condition ? <ComponentA /> : <ComponentB />}
   ```

## Differences from React

### Similarities

- JSX syntax is fully compatible
- Fragment support
- Similar event handling
- Function Component concept is the same

### Key Differences

1. **No Hooks**
   - Uses MVI architecture instead of useState/useEffect
   - Uses Mixins for code reuse

2. **State Management**
   - React: useState, useReducer
   - Marabutan: MVI model functions

3. **Lifecycle**
   - React: useEffect, useLayoutEffect
   - Marabutan: created, beforeRender, afterRender, destroyed

4. **Component Definition**
   ```tsx
   // React
   function Component() {
     const [state, setState] = useState(0);
     return <div>{state}</div>;
   }

   // Marabutan
   const Component = createComponent({
     initialState: { value: 0 },
     model: (state, action) => /* ... */,
     view: (state, dispatch) => <div>{state.value}</div>
   });
   ```

## Troubleshooting

### Common Issues

1. **JSX not recognized**
   - Check jsx configuration in tsconfig.json
   - Ensure file extension is .tsx

2. **Type errors**
   - Import correct type definitions
   - Use `import type { VNode } from './vdom/types'`

3. **Event handler types**
   ```tsx
   // Correct
   onClick={(e: MouseEvent) => handleClick(e)}

   // Or let TypeScript infer
   onClick={handleClick}
   ```

4. **Children types**
   ```tsx
   interface Props {
     children?: React.ReactNode; // Use ReactNode type
   }
   ```

## Example Projects

Check `src/examples/components-jsx.tsx` for complete examples:

- Counter component
- Timer component
- Todo List component
- Component composition examples

## Summary

Marabutan's JSX/TSX support provides a familiar development experience while integrating the advantages of MVI architecture. By following this guide and best practices, you can build high-performance, maintainable user interfaces.

