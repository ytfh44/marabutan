# Utils and Warnings API Documentation

## Overview

The Utils and Warnings system provides development-time validation, error checking, and debugging utilities for the Marabutan framework. It includes environment detection, warning management, performance monitoring, and validation functions that help developers catch issues early and optimize their applications.

## Core Types

### WarningType

```typescript
enum WarningType {
  MISSING_KEY = 'MISSING_KEY',
  DEPRECATED_API = 'DEPRECATED_API',
  PERFORMANCE = 'PERFORMANCE',
  INVALID_PROP = 'INVALID_PROP',
  LIFECYCLE = 'LIFECYCLE'
}
```

Enumeration of different warning types used throughout the framework.

### SourceLocation

```typescript
interface SourceLocation {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}
```

Source code location information for debugging and error reporting.

## Environment Detection

### isDevelopment

Checks if the application is running in development mode.

```typescript
function isDevelopment(): boolean
```

**Returns:** `true` if `NODE_ENV` is not 'production', `false` otherwise

**Example:**
```typescript
import { isDevelopment } from './utils/warnings';

if (isDevelopment()) {
  console.log('Running in development mode');
  // Enable additional debugging features
}
```

## Warning System

### warn

Emits a development warning with optional deduplication.

```typescript
function warn(
  type: WarningType,
  message?: string,
  once: boolean = true
): void
```

**Parameters:**
- `type`: The warning type from WarningType enum
- `message`: Custom warning message (optional, uses default message for type if not provided)
- `once`: Whether to show this warning only once (default: true)

**Example:**
```typescript
import { warn, WarningType } from './utils/warnings';

// Using predefined warning type
warn(WarningType.MISSING_KEY);

// Using custom message
warn(WarningType.PERFORMANCE, 'Custom performance warning message');

// Show warning every time (not just once)
warn(WarningType.INVALID_PROP, 'Invalid prop detected', false);
```

### clearWarnings

Clears all previously shown warnings. Useful for testing.

```typescript
function clearWarnings(): void
```

**Example:**
```typescript
import { clearWarnings } from './utils/warnings';

// Clear warning history before running tests
clearWarnings();
```

## Validation Functions

### checkForMissingKeys

Validates that list items have proper keys in development mode.

```typescript
function checkForMissingKeys(
  children: (VNode | string | number)[],
  parentComponent?: string
): void
```

**Parameters:**
- `children`: Array of virtual DOM children to check
- `parentComponent`: Optional component name for better error messages

**Example:**
```typescript
import { checkForMissingKeys } from './utils/warnings';
import { createElement } from './vdom/createElement';

// Good - has keys
const goodList = createElement('ul', {},
  createElement('li', { key: 'item1' }, 'Item 1'),
  createElement('li', { key: 'item2' }, 'Item 2')
);

// Bad - missing keys (will warn in development)
const badList = createElement('ul', {},
  createElement('li', {}, 'Item 1'), // Missing key!
  createElement('li', {}, 'Item 2')  // Missing key!
);

// Check manually
checkForMissingKeys(badList.children, 'MyListComponent');
```

### checkProps

Validates component props against allowed prop names.

```typescript
function checkProps(
  componentName: string,
  props: Record<string, unknown>,
  validProps?: string[]
): void
```

**Parameters:**
- `componentName`: Name of the component for error messages
- `props`: Props object to validate
- `validProps`: Array of valid prop names (optional)

**Example:**
```typescript
import { checkProps } from './utils/warnings';

const MyComponent = (props) => {
  // Validate props in development
  checkProps('MyComponent', props, ['title', 'variant', 'onClick']);

  return createElement('button', {
    className: props.variant || 'default',
    onClick: props.onClick
  }, props.title);
};
```

### validateElementType

Validates that an element type is valid.

```typescript
function validateElementType(type: unknown): void
```

**Parameters:**
- `type`: Element type to validate

**Example:**
```typescript
import { validateElementType } from './utils/warnings';

// Valid types
validateElementType('div');        // string - OK
validateElementType(MyComponent);  // function - OK
validateElementType(Fragment);     // symbol - OK

// Invalid type (will warn in development)
validateElementType(123);          // number - warns
```

## Specialized Warning Functions

### warnDeprecated

Warns about usage of deprecated API features.

```typescript
function warnDeprecated(oldApi: string, newApi?: string): void
```

**Parameters:**
- `oldApi`: Name of the deprecated API
- `newApi`: Name of the recommended replacement (optional)

**Example:**
```typescript
import { warnDeprecated } from './utils/warnings';

// Simple deprecation warning
warnDeprecated('oldFunction');

// With replacement suggestion
warnDeprecated('oldFunction', 'newFunction');
```

### warnPerformance

Emits a performance-related warning with optional additional details.

```typescript
function warnPerformance(message: string, details?: string): void
```

**Parameters:**
- `message`: Main performance warning message
- `details`: Additional details about the performance issue

**Example:**
```typescript
import { warnPerformance } from './utils/warnings';

// Simple performance warning
warnPerformance('Large component tree detected');

// With additional details
warnPerformance(
  'Component re-renders frequently',
  'Consider using React.memo or useMemo for expensive calculations'
);
```

## Performance Monitoring

### checkTreeDepth

Monitors component tree depth and warns about potentially problematic depths.

```typescript
function checkTreeDepth(depth: number, maxDepth: number = 50): void
```

**Parameters:**
- `depth`: Current component tree depth
- `maxDepth`: Maximum recommended depth (default: 50)

**Example:**
```typescript
import { checkTreeDepth } from './utils/warnings';

class ComponentRenderer {
  private depth = 0;

  renderComponent(component: any): VNode {
    this.depth++;
    checkTreeDepth(this.depth);

    try {
      return component.render();
    } finally {
      this.depth--;
    }
  }
}
```

## Development Helpers

### Warning Messages

The system includes predefined warning messages for each warning type:

```typescript
const warningMessages: Record<WarningType, string> = {
  [WarningType.MISSING_KEY]: 'Each child in a list should have a unique "key" prop.',
  [WarningType.DEPRECATED_API]: 'API is deprecated and will be removed in a future version.',
  [WarningType.PERFORMANCE]: 'Performance warning: potential optimization issue detected.',
  [WarningType.INVALID_PROP]: 'Invalid prop provided to component.',
  [WarningType.LIFECYCLE]: 'Lifecycle method called at inappropriate time.'
};
```

## Usage Examples

### Component Development with Validation

```typescript
import { createComponent } from './components/core';
import { checkForMissingKeys, checkProps, WarningType, warn } from './utils/warnings';

const ListComponent = createComponent({
  displayName: 'ListComponent',

  props: {
    items: [] as any[],
    renderItem: (item: any) => item.toString()
  },

  view: (state, props) => {
    // Validate props in development
    checkProps('ListComponent', props, ['items', 'renderItem', 'className']);

    // Custom validation
    if (isDevelopment() && (!props.items || !Array.isArray(props.items))) {
      warn(WarningType.INVALID_PROP, 'ListComponent: items prop must be an array');
    }

    const children = props.items.map((item, index) => {
      const renderedItem = props.renderItem(item);
      return createElement('li', { key: `item-${index}` }, renderedItem);
    });

    // Check for missing keys (though we set them above, this is an example)
    checkForMissingKeys(children, 'ListComponent');

    return createElement('ul', { className: 'list' }, ...children);
  }
});
```

### Custom Validation Utilities

```typescript
import { warn, WarningType, isDevelopment } from './utils/warnings';

// Custom validation for component props
export function validateComponentProps(
  componentName: string,
  props: Record<string, any>,
  schema: Record<string, { type: string; required?: boolean }>
): void {
  if (!isDevelopment()) return;

  for (const [propName, config] of Object.entries(schema)) {
    const value = props[propName];

    if (config.required && (value === undefined || value === null)) {
      warn(WarningType.INVALID_PROP,
        `${componentName}: Required prop "${propName}" is missing`);
      continue;
    }

    if (value !== undefined && typeof value !== config.type) {
      warn(WarningType.INVALID_PROP,
        `${componentName}: Prop "${propName}" should be of type ${config.type}, got ${typeof value}`);
    }
  }
}

// Usage in a component
const UserProfileComponent = createComponent({
  view: (state, props) => {
    validateComponentProps('UserProfileComponent', props, {
      user: { type: 'object', required: true },
      showAvatar: { type: 'boolean' },
      onUpdate: { type: 'function' }
    });

    return createElement('div', { className: 'user-profile' },
      // ... component JSX
    );
  }
});
```

### Performance Monitoring in Components

```typescript
import { createComponent } from './components/core';
import { warnPerformance, checkTreeDepth } from './utils/warnings';

let renderCount = 0;
let treeDepth = 0;

const PerformanceMonitoredComponent = createComponent({
  displayName: 'PerformanceMonitoredComponent',

  lifecycle: {
    beforeRender: () => {
      renderCount++;
      treeDepth++;

      // Warn about frequent re-renders
      if (renderCount > 10) {
        warnPerformance(
          'Component re-rendering frequently',
          'Consider optimizing state updates or using memoization'
        );
      }

      checkTreeDepth(treeDepth);
    },

    afterRender: () => {
      treeDepth--;
    }
  },

  view: (state) => {
    // Expensive operation - monitor performance
    const startTime = performance.now();

    // ... component logic ...

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > 16) { // More than one frame at 60fps
      warnPerformance(
        'Slow component render detected',
        `Render took ${renderTime.toFixed(2)}ms. Consider optimizing.`
      );
    }

    return createElement('div', {}, 'Content');
  }
});
```

### Development-Only Debugging Features

```typescript
import { isDevelopment, warn } from './utils/warnings';

// Development-only logging utility
export function devLog(message: string, data?: any): void {
  if (!isDevelopment()) return;

  console.log(`[DEV] ${message}`, data);
}

// Development-only performance measurement
export function measurePerformance<T>(
  label: string,
  fn: () => T
): T {
  if (!isDevelopment()) return fn();

  const start = performance.now();
  try {
    return fn();
  } finally {
    const end = performance.now();
    console.log(`[PERF] ${label}: ${(end - start).toFixed(2)}ms`);
  }
}

// Usage in components
const DebugComponent = createComponent({
  view: (state) => {
    devLog('Rendering DebugComponent', { state });

    return measurePerformance('DebugComponent render', () =>
      createElement('div', { className: 'debug' },
        createElement('h1', {}, 'Debug Info'),
        createElement('pre', {}, JSON.stringify(state, null, 2))
      )
    );
  }
});
```

## Integration with Framework Systems

### With Components

```typescript
import { createComponent } from './components/core';
import { checkProps, warnDeprecated } from './utils/warnings';

const LegacyComponent = createComponent({
  created: () => {
    warnDeprecated('LegacyComponent', 'ModernComponent');
  },

  view: (state, props) => {
    checkProps('LegacyComponent', props, ['legacyProp']);

    // ... component logic
  }
});
```

### With MVI Architecture

```typescript
import { run } from './mvi/core';
import { warnPerformance, isDevelopment } from './utils/warnings';

const app = {
  initialState: { count: 0, lastRenderTime: 0 },

  model: (state, action) => {
    // Development-only state tracking
    if (isDevelopment()) {
      if (action.type === 'INCREMENT' && state.count > 1000) {
        warnPerformance('High counter value detected', 'Consider resetting or optimizing');
      }
    }

    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      default:
        return state;
    }
  },

  view: (state) => {
    const renderStart = performance.now();

    const result = createElement('div', {},
      createElement('h1', {}, `Count: ${state.count}`),
      createElement('button', {
        onClick: () => ({ type: 'INCREMENT' })
      }, 'Increment')
    );

    if (isDevelopment()) {
      const renderTime = performance.now() - renderStart;
      if (renderTime > 10) {
        warnPerformance('Slow view render', `View took ${renderTime.toFixed(2)}ms`);
      }
    }

    return result;
  }
};

const mviApp = run(app);
```

### With Virtual DOM

```typescript
import { createElement } from './vdom/createElement';
import { diff } from './vdom/diff';
import { checkForMissingKeys, warnPerformance } from './utils/warnings';

function renderWithValidation(oldVNode: VNode | null, newVNode: VNode | null) {
  // Validate keys in development
  if (newVNode && newVNode.children) {
    checkForMissingKeys(newVNode.children, 'VirtualDOM');
  }

  // Performance monitoring for diffing
  const startTime = performance.now();
  const patches = diff(oldVNode, newVNode);
  const diffTime = performance.now() - startTime;

  if (diffTime > 5) {
    warnPerformance('Slow virtual DOM diff', `Diff took ${diffTime.toFixed(2)}ms`);
  }

  return patches;
}
```

## Best Practices

### 1. Use Appropriate Warning Types

```typescript
// Good - use specific warning types
warn(WarningType.MISSING_KEY);           // For missing keys
warn(WarningType.PERFORMANCE);           // For performance issues
warn(WarningType.DEPRECATED_API);        // For deprecated features

// Avoid - generic warnings without context
console.warn('Something is wrong');      // Too vague
```

### 2. Provide Context in Warnings

```typescript
// Good - include component and context
warn(WarningType.INVALID_PROP, `MyComponent: "invalidProp" is not a valid prop`);

// Good - include values for debugging
warn(WarningType.PERFORMANCE, `Large array detected with ${items.length} items`);
```

### 3. Use Development-Only Checks

```typescript
// Good - wrap expensive validations in development check
if (isDevelopment()) {
  validateComplexSchema(props);
  checkPerformanceMetrics();
}

// Avoid - expensive checks in production
validateComplexSchema(props);  // Runs in production too!
```

### 4. Avoid Warning Spam

```typescript
// Good - use once flag for repeated warnings
warn(WarningType.MISSING_KEY, 'Missing key in list', true); // Shows once

// For dynamic content, consider custom deduplication
const warningKey = `missing-key-${componentName}-${listId}`;
if (!shownWarnings.has(warningKey)) {
  warn(WarningType.MISSING_KEY, `Missing key in ${componentName}`);
  shownWarnings.add(warningKey);
}
```

### 5. Combine Warnings with Error Handling

```typescript
// Good - warn in development, handle gracefully in production
function safeOperation(data: any) {
  try {
    return riskyOperation(data);
  } catch (error) {
    if (isDevelopment()) {
      warn(WarningType.LIFECYCLE, `Operation failed: ${error.message}`);
    }
    return fallbackValue;
  }
}
```

## Performance Considerations

### Development vs Production

- All validation and warning functions automatically disable in production
- Use `isDevelopment()` checks for custom development-only code
- Warnings use efficient deduplication to avoid spam

### Memory Management

- Warning deduplication uses a Set with string keys
- Consider clearing warnings in long-running applications if needed
- Source location tracking only in development runtime

### Bundle Size Impact

- Warning utilities are tree-shaken in production builds
- Development-only code doesn't affect production bundle size
- Consider lazy-loading heavy validation logic

## Error Handling

The warnings system is designed to be fail-safe:

```typescript
// Warnings never throw errors - they're purely informational
try {
  warn(WarningType.INVALID_PROP, 'Test warning');
} catch (error) {
  // This will never happen - warnings are safe to call
}

// Safe to call with invalid parameters
warn('INVALID_TYPE' as any, undefined);  // Won't crash
```

This utilities and warnings system provides comprehensive development support while maintaining zero performance impact in production environments.
