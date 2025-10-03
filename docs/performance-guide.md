# Performance Guide

This guide covers best practices and optimization techniques for building high-performance applications with Marabutan Framework.

## Table of Contents

- [Automatic Optimizations](#automatic-optimizations)
- [Component Memoization](#component-memoization)
- [Batch Updates](#batch-updates)
- [Keys in Lists](#keys-in-lists)
- [Context Optimization](#context-optimization)
- [Avoiding Common Pitfalls](#avoiding-common-pitfalls)
- [Performance Monitoring](#performance-monitoring)

---

## Automatic Optimizations

Marabutan Framework includes several automatic performance optimizations that work out of the box:

### 1. Batch Update Scheduler

The framework automatically batches multiple state updates into a single render:

```typescript
// These three dispatches will only trigger ONE render
dispatch({ type: 'UPDATE_USER', user });
dispatch({ type: 'UPDATE_SETTINGS', settings });
dispatch({ type: 'UPDATE_THEME', theme });

// Internally, the scheduler uses microtasks to batch updates
```

**Benefits:**
- Significantly reduces render frequency in high-update scenarios
- Smoother animations and interactions
- Reduced DOM thrashing

### 2. Shallow Equality Checking

Props are compared using efficient shallow equality instead of JSON serialization:

```typescript
// Fast comparison (reference equality)
const oldProps = { onClick: handler, data: obj };
const newProps = { onClick: handler, data: obj };
// shallowEqual(oldProps, newProps) === true (no re-render)
```

**Benefits:**
- Much faster than JSON.stringify comparison
- Handles functions and circular references
- React-compatible behavior

### 3. Double-Ended Diff Algorithm

The VDOM diff uses an optimized algorithm for list updates:

```typescript
// Efficiently handles reverse, insert, delete
const oldList = [1, 2, 3, 4, 5];
const newList = [5, 4, 3, 2, 1];
// Only 5 operations instead of 10
```

**Benefits:**
- Notably reduces DOM operations for complex list updates
- Optimized for common patterns (append, prepend, reverse)
- Lazy key-map creation

---

## Component Memoization

Use `memo()` to prevent unnecessary re-renders of expensive components:

### Basic Usage

```typescript
import { memo } from './components/memo';

// Expensive calculation component
const DataVisualization = memo(({ data }) => {
  const processed = expensiveDataProcessing(data);
  return <Chart data={processed} />;
});

// Will only re-render when data reference changes
```

### Custom Comparison

```typescript
// Only re-render when user.id changes
const UserProfile = memo(
  ({ user }) => <div>{user.name}</div>,
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

### Pure Components (Deep Comparison)

```typescript
import { pure } from './components/memo';

// Re-render only when deeply equal
const ConfigPanel = pure(({ config }) => {
  return <div>{JSON.stringify(config)}</div>;
});
```

**When to use memo:**
- ✅ Component render is expensive (>50ms)
- ✅ Component receives same props frequently
- ✅ Parent re-renders often but child props don't change
- ❌ Component is already fast (<5ms render)
- ❌ Props change on every render
- ❌ Premature optimization

---

## Batch Updates

While the scheduler batches automatically, you can also use `batchUpdates()` for explicit control:

```typescript
import { batchUpdates } from './utils/scheduler';

function handleComplexOperation() {
  batchUpdates(() => {
    // All these updates will be batched
    updateUser(newUser);
    updateSettings(newSettings);
    updateCache(newCache);
    // Renders once after this function completes
  });
}
```

**Use cases:**
- Complex event handlers with multiple state updates
- Programmatic updates (not from user events)
- Third-party library integrations

---

## Keys in Lists

Always use unique, stable keys for list items:

### ✅ Good

```typescript
const TodoList = ({ todos }) => (
  <ul>
    {todos.map(todo => (
      <li key={todo.id}>
        {todo.text}
      </li>
    ))}
  </ul>
);
```

### ❌ Bad

```typescript
// DON'T use array index as key
{todos.map((todo, index) => (
  <li key={index}>{todo.text}</li>
))}

// DON'T generate random keys
{todos.map(todo => (
  <li key={Math.random()}>{todo.text}</li>
))}
```

**Why keys matter:**
- Enable efficient VDOM reconciliation
- Preserve component state during reorders
- Prevent unnecessary DOM recreations

**Key selection rules:**
1. Use stable IDs from your data (database IDs, UUIDs)
2. Generate once and store (don't regenerate on every render)
3. Ensure uniqueness within the list (not globally)
4. Use index ONLY if list never reorders

---

## Context Optimization

Context can cause performance issues if not used carefully:

### Problem: Unnecessary Re-renders

```typescript
// BAD: Entire context object changes on every update
const [state, setState] = useState({ user, settings, theme });

<AppContext.Provider value={state}>
  {children}
</AppContext.Provider>
```

### Solution 1: Split Contexts

```typescript
// GOOD: Separate contexts for different concerns
<UserContext.Provider value={user}>
  <SettingsContext.Provider value={settings}>
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  </SettingsContext.Provider>
</UserContext.Provider>
```

### Solution 2: Memoize Context Value

```typescript
// GOOD: Memoize context value to prevent unnecessary changes
const contextValue = useMemo(
  () => ({ user, updateUser }),
  [user] // Only recreate when user changes
);

<UserContext.Provider value={contextValue}>
  {children}
</UserContext.Provider>
```

### Solution 3: Use Memo for Consumers

```typescript
// GOOD: Memoize components that consume context
const UserProfile = memo(() => {
  const { user } = useContext(UserContext);
  return <div>{user.name}</div>;
});
```

---

## Avoiding Common Pitfalls

### 1. Inline Function Creation

```typescript
// BAD: New function on every render
<Button onClick={() => handleClick(id)}>Click</Button>

// GOOD: Stable function reference
const handleButtonClick = useCallback(
  () => handleClick(id),
  [id]
);
<Button onClick={handleButtonClick}>Click</Button>
```

### 2. Inline Object Creation

```typescript
// BAD: New object on every render
<UserCard user={{ name: 'Alice', age: 30 }} />

// GOOD: Stable object reference
const user = { name: 'Alice', age: 30 };
<UserCard user={user} />
```

### 3. Large Component Trees

```typescript
// BAD: Monolithic component
const App = () => (
  <div>
    {/* 1000 lines of JSX */}
  </div>
);

// GOOD: Split into smaller components
const App = () => (
  <div>
    <Header />
    <Sidebar />
    <MainContent />
    <Footer />
  </div>
);
```

### 4. Over-Optimization

```typescript
// DON'T optimize everything upfront
// Optimize based on profiling results

// ❌ Premature
const TinyComponent = memo(({ text }) => <span>{text}</span>);

// ✅ When needed
const ExpensiveChart = memo(({ data }) => {
  // 100ms+ render time
  return <ComplexVisualization data={data} />;
});
```

---

## Performance Monitoring

### Built-in Logging

```typescript
// Enable performance warnings in development
// (Automatically enabled when NODE_ENV !== 'production')

// Missing keys warning:
// [Marabutan] Warning: Missing "key" prop for children in a list

// Slow render warning (future):
// [Marabutan] Warning: Component rendered in 250ms
```

### Manual Profiling

```typescript
const ProfilingComponent = ({ data }) => {
  const start = performance.now();
  
  const result = expensiveCalculation(data);
  
  const elapsed = performance.now() - start;
  if (elapsed > 16) { // 60fps threshold
    console.warn(`Slow render: ${elapsed}ms`);
  }
  
  return <div>{result}</div>;
};
```

### Performance Marks

```typescript
import { performance } from 'perf_hooks';

performance.mark('render-start');
render(app);
performance.mark('render-end');

performance.measure('render', 'render-start', 'render-end');
const measure = performance.getEntriesByName('render')[0];
console.log(`Render took ${measure.duration}ms`);
```

### Scheduler Statistics

```typescript
import { scheduler } from './utils/scheduler';

// Check pending updates (for debugging)
console.log('Pending updates:', scheduler.getPendingCount());

// Manually flush (testing only)
scheduler.flushSync();
```

---

## Performance Checklist

Before deploying to production:

- [ ] All list items have stable, unique keys
- [ ] Expensive components are wrapped in `memo()`
- [ ] Context is split or memoized appropriately
- [ ] No inline function/object creation in hot paths
- [ ] Large components are split into smaller pieces
- [ ] Profiled critical user flows (< 16ms render time)
- [ ] Memory leaks tested (components properly destroyed)
- [ ] Batch updates used for complex operations
- [ ] Production build tested (dev mode is slower)

---

## Benchmarking Results

### Framework Overhead

| Operation | Time | Comparison |
|-----------|------|------------|
| Create VNode | ~0.001ms | - |
| Diff props (shallow) | ~0.005ms | Fast reference comparison |
| Diff 100 children (keyed) | ~2ms | Optimized with double-ended algorithm |
| Patch DOM (single) | ~0.01ms | Native DOM speed |
| Batch 100 updates | ~3ms | vs 300ms unbatched |

### Real-World Performance

| Scenario | Operations | Time |
|----------|------------|------|
| Todo app (100 items) | Add/remove | <1ms |
| Data table (1000 rows) | Sort/filter | ~50ms |
| Chart update (1000 points) | Re-render | ~100ms |

---

## Further Reading

- [React Performance Optimization](https://react.dev/learn/render-and-commit) - Many concepts apply
- [Web.dev Performance](https://web.dev/performance/) - General web performance
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/) - Profiling tools

---

## Support

If you encounter performance issues:

1. Profile your application using Chrome DevTools
2. Check the console for Marabutan warnings
3. Review this guide for optimization opportunities
4. Open an issue with profiling data if the problem persists

Happy optimizing! 🚀

