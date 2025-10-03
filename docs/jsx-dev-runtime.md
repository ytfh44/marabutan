# JSX Development Runtime Documentation

## Overview

`jsx-dev-runtime` is the JSX development runtime for the Marabutan framework. It provides additional development-time validation, debugging information, and error detection features on top of the standard JSX runtime.

## Features

### 1. Enhanced Debugging Information

In development mode, the jsxDEV function automatically collects and stores source code location information:

```typescript
interface SourceLocation {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}
```

This information is very useful in development tools and error reporting.

### 2. Development-time Validation

#### Common Error Detection

- **class vs className**: Automatically detects incorrect use of `class` instead of `className`
- **for vs htmlFor**: Detects `for` attribute on `<label>` elements, suggests using `htmlFor`
- **Element type validation**: Validates that element types are valid strings, functions, or Symbols

```typescript
// ❌ Incorrect example
<div class="container">Content</div>
// Warning: Invalid prop "class" supplied to element. Did you mean "className"?

// ✅ Correct example
<div className="container">Content</div>
```

### 3. Differences from Production Runtime

| Feature | jsx-runtime | jsx-dev-runtime |
|---------|-------------|-----------------|
| Basic JSX transformation | ✅ | ✅ |
| Development-time validation | ❌ | ✅ |
| Source location tracking | ❌ | ✅ |
| Performance optimization | ✅ | ⚠️ (slightly slower) |
| Error messages | Basic | Detailed |

## API Reference

### jsxDEV

The main JSX development factory function.

```typescript
function jsxDEV(
  type: string | Function | symbol,
  props: Record<string, any> | null,
  key?: string | number,
  isStaticChildren?: boolean,
  source?: SourceLocation,
  self?: any
): VNode
```

**Parameters:**
- `type`: Element type (tag name, function component, or Fragment)
- `props`: Element properties
- `key`: Unique key for list rendering
- `isStaticChildren`: Whether children are static (optimization hint)
- `source`: Source code location information
- `self`: The 'this' context when creating the element

**Example:**

```tsx
// Automatically called (by JSX compiler)
const element = <div className="test">Content</div>;

// Equivalent to
const element = jsxDEV(
  'div',
  { className: 'test', children: 'Content' },
  undefined,
  false,
  { fileName: 'app.tsx', lineNumber: 10 },
  this
);
```

### jsx

Standard JSX function for development mode (simplified version of jsxDEV).

```typescript
function jsx(
  type: string | Function | symbol,
  props: Record<string, any> | null,
  key?: string | number
): VNode
```

### jsxs

JSX function for static children.

```typescript
function jsxs(
  type: string | Function | symbol,
  props: Record<string, any> | null,
  key?: string | number
): VNode
```

### Fragment

Symbol used to group multiple children without adding extra DOM nodes.

```typescript
export const Fragment: unique symbol;
```

**Usage example:**

```tsx
import { Fragment } from './jsx-dev-runtime';

const List = () => (
  <Fragment>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </Fragment>
);

// Or use short syntax
const List = () => (
  <>
    <li>Item 1</li>
    <li>Item 2</li>
  </>
);
```

## Configuration

### TypeScript Configuration

Ensure `tsconfig.json` is correctly configured:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "."
  }
}
```

### Vite Configuration

Ensure `vite.config.ts` is correctly configured:

```typescript
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '.',
  }
});
```

## Development-time Warnings

The development runtime will emit warnings in the following situations:

### 1. Missing Key Attribute

```tsx
// ❌ Missing key
<ul>
  {items.map(item => <li>{item}</li>)}
</ul>

// ✅ Correct use of key
<ul>
  {items.map((item, index) => <li key={index}>{item}</li>)}
</ul>
```

### 2. Invalid Property Names

```tsx
// ❌ Use class instead of className
<div class="container">Content</div>

// ✅ Use className
<div className="container">Content</div>

// ❌ Label uses for instead of htmlFor
<label for="input-id">Label</label>

// ✅ Use htmlFor
<label htmlFor="input-id">Label</label>
```

### 3. Invalid Element Types

```tsx
// ❌ Invalid element type
const element = jsx(123, {});

// ✅ Valid types
const element = <div>Content</div>;
const Component = () => <div>Component</div>;
const element2 = <Component />;
```

## Performance Considerations

1. **Development mode only**: `jsx-dev-runtime` is only used in development environment, production automatically uses the optimized `jsx-runtime`

2. **Performance overhead**: Due to additional validation and debugging information, the development runtime is slightly slower than the production runtime

3. **Environment detection**: Uses `process.env.NODE_ENV` to detect environment, ensuring development features are disabled in production

## Debugging Tips

### View Source Location

```typescript
const element = <div>Content</div>;

// In development mode, element contains __source information
console.log((element as any).__source);
// Output: { fileName: 'app.tsx', lineNumber: 10 }
```

### Use __self Context

```typescript
class Component {
  render() {
    const element = <div>Content</div>;
    // element.__self points to Component instance
    console.log((element as any).__self === this); // true
  }
}
```

## Best Practices

1. **Always provide key**: Always provide unique key attributes when rendering lists

2. **Use correct property names**:
   - Use `className` instead of `class`
   - Use `htmlFor` instead of `for`

3. **Type safety**: Use TypeScript type checking to avoid runtime errors

4. **Pay attention to warnings**: Development-time warning messages help identify potential problems

5. **Performance analysis**: Use development tools to analyze performance, test final performance in production environment

## React Compatibility

Marabutan's JSX runtime is designed to be compatible with React's new JSX transform:

- Uses the same `jsx`/`jsxDEV`/`jsxs` API
- Supports the same Fragment syntax
- Compatible with React DevTools debugging information format

This makes migration from React to Marabutan easier.

## Troubleshooting

### Import Errors

If you encounter `Cannot find module 'jsx-dev-runtime'` error:

1. Ensure `jsx-dev-runtime.js` exists in the project root directory
2. Check if `jsxImportSource` configuration is correct
3. Clear build cache and rebuild

### Type Errors

If TypeScript reports type errors:

1. Ensure `jsx.d.ts` file is correctly configured
2. Check JSX-related configuration in `tsconfig.json`
3. Restart TypeScript server

### Runtime Warnings

If you see unexpected warnings:

1. Check if code uses deprecated property names
2. Ensure list rendering uses key attributes
3. Verify element types are valid

## Related Resources

- [JSX/TSX Usage Guide](./jsx-tsx-guide.md)
- [JSX Runtime API](./jsx-runtime-api.md)
- [VDOM API Documentation](./vdom-api.md)
- [Component System Documentation](./components-api.md)
- [MVI Architecture API](./mvi-api.md)
- [Utils and Warnings API](./utils-api.md)
- [Framework Integration Guide](./integration-guide.md)
- [React New JSX Transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

