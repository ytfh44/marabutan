# Context API Documentation

## Overview

The Context API provides a powerful way to pass data through the component tree without having to pass props down manually at every level. It's particularly useful for global state like themes, user authentication, language settings, or any data that many components need access to.

**Implementation Status**: ✅ **FULLY IMPLEMENTED**

The Marabutan Context API includes:
- **Global Registry + Symbol Identification**: Unique Symbol IDs for each context
- **Automatic Subscription**: Components automatically re-render when context values change
- **Deep Component Integration**: Seamlessly integrated with the component lifecycle
- **Full TypeScript Generic Support**: Type-safe context values throughout

## Architecture

### Design Decisions

1. **Propagation Mechanism**: Global registry with Symbol-based identification
   - Each context has a unique Symbol ID
   - Values stored in a global Map for efficient lookup
   - Render stack supports nested Providers

2. **Subscription Mechanism**: Automatic subscription with forced re-rendering
   - Consumers automatically subscribe to context changes
   - Value changes trigger all subscribers
   - Automatic cleanup on component destruction

3. **Integration**: Deep integration with component system
   - Components have built-in context support
   - Lifecycle hooks for subscription management
   - `forceUpdate` method for context-triggered re-renders

4. **Type Safety**: Complete TypeScript generic support
   - Full type inference through Provider/Consumer chain
   - Type-safe context values
   - IntelliSense support

## Core Types

### Context<T>

The main context object interface with generic type parameter.

```typescript
interface Context<T> {
  readonly id: ContextId;
  readonly defaultValue: T;
  readonly Provider: ProviderComponent<T>;
  readonly Consumer: ConsumerComponent<T>;
}
```

### ProviderProps<T>

Props for the Provider component.

```typescript
interface ProviderProps<T> {
  value: T;
  children?: any;
}
```

### ConsumerProps<T>

Props for the Consumer component.

```typescript
interface ConsumerProps<T> {
  children: (value: T) => any;
}
```

## Core Functions

### createContext

Creates a new context with a default value and full TypeScript generic support.

```typescript
function createContext<T>(defaultValue: T): Context<T>
```

**Parameters:**
- `defaultValue`: The default value used when no Provider is found in the component tree

**Returns:** A context object containing Provider, Consumer, id, and defaultValue

**Example:**
```typescript
import { createContext } from './context';

// Create a theme context with type safety
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
});

// TypeScript knows the exact type!
const { Provider, Consumer } = ThemeContext;
```

### useContextInComponent

Helper function to use context directly in component view functions.

```typescript
function useContextInComponent<T>(
  context: Context<T>,
  componentInstance: ComponentInstance
): T
```

**Parameters:**
- `context`: The context object to consume
- `componentInstance`: The component instance (usually `this` in view function)

**Returns:** Current context value

**Features:**
- Automatically subscribes to context changes
- Triggers component re-render when value changes
- Handles cleanup on component destruction

**Example:**
```typescript
import { createComponent } from './components/core';
import { useContextInComponent } from './context';

const MyComponent = createComponent({
  displayName: 'MyComponent',
  initialState: {},
  
  view: function(state) {
    // Use context in view function
    const theme = useContextInComponent(ThemeContext, this);
    
    return createElement('div', {
      className: `app ${theme.theme}`
    }, 'Themed content');
  }
});
```

## Usage Examples

### Basic Context Usage

```typescript
import { createContext, createElement } from './index';

// 1. Create a context
const UserContext = createContext<{ name: string; role: string }>({
  name: 'Guest',
  role: 'viewer'
});

// 2. Use Provider to supply value
const App = () => (
  <UserContext.Provider value={{ name: 'John Doe', role: 'admin' }}>
    <Dashboard />
  </UserContext.Provider>
);

// 3. Use Consumer to access value
const Dashboard = () => (
  <UserContext.Consumer>
    {({ name, role }) => (
      <div>
        <h1>Welcome, {name}!</h1>
        <p>Role: {role}</p>
      </div>
    )}
  </UserContext.Consumer>
);
```

### Theme Context Example

```typescript
import { createContext, createComponent } from './index';

// Define theme type
interface Theme {
  theme: 'light' | 'dark';
  colors: {
    primary: string;
    background: string;
    text: string;
  };
  toggleTheme: () => void;
}

// Create context with default theme
const ThemeContext = createContext<Theme>({
  theme: 'light',
  colors: {
    primary: '#007bff',
    background: '#ffffff',
    text: '#000000'
  },
  toggleTheme: () => {}
});

// Theme provider component
const ThemeProvider = createComponent({
  displayName: 'ThemeProvider',
  
  initialState: {
    theme: 'light' as 'light' | 'dark'
  },
  
  model: (state, action: any) => {
    if (action.type === 'TOGGLE_THEME') {
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    }
    return state;
  },
  
  view: (state, dispatch) => {
    const colors = state.theme === 'light' 
      ? { primary: '#007bff', background: '#ffffff', text: '#000000' }
      : { primary: '#4dabf7', background: '#1a1a1a', text: '#ffffff' };
    
    const themeValue: Theme = {
      theme: state.theme,
      colors,
      toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' })
    };
    
    return createElement(
      ThemeContext.Provider,
      { value: themeValue },
      // Children will go here
    );
  }
});

// Component that uses theme
const ThemedButton = () => (
  <ThemeContext.Consumer>
    {({ theme, colors, toggleTheme }) => (
    <button
        style={{
          backgroundColor: colors.primary,
          color: colors.background
        }}
      onClick={toggleTheme}
    >
      Switch to {theme === 'light' ? 'dark' : 'light'} theme
    </button>
    )}
  </ThemeContext.Consumer>
  );
```

### Authentication Context

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isLoading: false
});

// Auth provider component
const AuthProvider = createComponent({
  displayName: 'AuthProvider',
  
  initialState: {
    user: null as User | null,
    isLoading: false
  },
  
  model: (state, action: any) => {
    switch (action.type) {
      case 'LOGIN_START':
        return { ...state, isLoading: true };
      case 'LOGIN_SUCCESS':
        return { ...state, user: action.user, isLoading: false };
      case 'LOGIN_ERROR':
        return { ...state, isLoading: false };
      case 'LOGOUT':
        return { ...state, user: null };
      default:
        return state;
    }
  },
  
  view: (state, dispatch) => {
    const authValue: AuthContextType = {
      user: state.user,
      isAuthenticated: state.user !== null,
      isLoading: state.isLoading,
      
      login: async (username, password) => {
        dispatch({ type: 'LOGIN_START' });
        try {
          const user = await api.login(username, password);
          dispatch({ type: 'LOGIN_SUCCESS', user });
        } catch (error) {
          dispatch({ type: 'LOGIN_ERROR', error });
        }
      },
      
      logout: () => {
        dispatch({ type: 'LOGOUT' });
      }
    };
    
    return createElement(
      AuthContext.Provider,
      { value: authValue },
      // Children
    );
  }
});

// Protected route component
const ProtectedRoute = ({ children }) => (
  <AuthContext.Consumer>
    {({ isAuthenticated, isLoading }) => {
      if (isLoading) {
        return <div>Loading...</div>;
      }
      
      if (!isAuthenticated) {
        return <LoginPage />;
      }
      
      return children;
    }}
  </AuthContext.Consumer>
);
```

### Nested Contexts

```typescript
// Multiple contexts can be nested
const App = () => (
  <ThemeContext.Provider value={themeValue}>
    <AuthContext.Provider value={authValue}>
      <LocaleContext.Provider value={localeValue}>
        <AppContent />
      </LocaleContext.Provider>
    </AuthContext.Provider>
  </ThemeContext.Provider>
);

// Component using multiple contexts
const UserProfile = () => (
  <ThemeContext.Consumer>
    {(theme) => (
      <AuthContext.Consumer>
        {(auth) => (
          <LocaleContext.Consumer>
            {(locale) => (
              <div style={{ color: theme.colors.text }}>
                <h1>{locale.translate('welcome', auth.user?.name)}</h1>
              </div>
            )}
          </LocaleContext.Consumer>
        )}
      </AuthContext.Consumer>
    )}
  </ThemeContext.Consumer>
);
```

### Component Integration with useContextInComponent

```typescript
import { useContextInComponent } from './context';

const SmartComponent = createComponent({
  displayName: 'SmartComponent',
  initialState: {},
  
  view: function(state) {
    // Automatically subscribes and triggers re-render on changes
    const theme = useContextInComponent(ThemeContext, this);
    const auth = useContextInComponent(AuthContext, this);
    
    return createElement('div', {
      style: { backgroundColor: theme.colors.background }
    },
      auth.isAuthenticated 
        ? `Welcome, ${auth.user?.name}!` 
        : 'Please log in'
    );
  }
});
```

## Integration with MVI Architecture

```typescript
import { run } from './mvi/core';
import { createContext } from './context';

// Create app-wide context
const AppContext = createContext({
  settings: { notifications: true },
  updateSettings: (settings: any) => {}
});

// MVI app with context
const app = {
  initialState: {
    settings: { notifications: true }
  },

  intent: (dispatch) => ({
    toggleNotifications: () => dispatch({ type: 'TOGGLE_NOTIFICATIONS' })
  }),

  model: (state, action) => {
    if (action.type === 'TOGGLE_NOTIFICATIONS') {
      return {
        ...state,
        settings: {
          ...state.settings,
          notifications: !state.settings.notifications
        }
      };
    }
    return state;
  },
  
  view: (state, dispatch) => {
    const contextValue = {
      settings: state.settings,
      updateSettings: (settings) => dispatch({ type: 'UPDATE_SETTINGS', settings })
    };
    
    return createElement(
      AppContext.Provider,
      { value: contextValue },
      createElement(AppContent)
    );
  },
  
  rootElement: '#app'
};

run(app);
```

## Best Practices

### 1. Use Context Sparingly

Context is best for truly global data. For component-specific data, use props.

```typescript
// ✅ Good - truly global data
const ThemeContext = createContext({ theme: 'light' });
const AuthContext = createContext({ user: null });

// ❌ Avoid - component-specific data
const ButtonSizeContext = createContext({ size: 'medium' }); // Better as a prop
```

### 2. Provide Sensible Defaults

Always provide meaningful default values that make sense when no Provider exists.

```typescript
// ✅ Good - meaningful defaults
const ThemeContext = createContext({
  theme: 'light',
  colors: { primary: '#007bff', secondary: '#6c757d' },
  toggleTheme: () => console.warn('ThemeProvider not found')
});

// ❌ Avoid - null/undefined requiring checks everywhere
const UserContext = createContext(null); // Forces null checks everywhere
```

### 3. Split Large Contexts

Instead of one monolithic context, use multiple focused contexts.

```typescript
// ✅ Good - separate concerns
const ThemeContext = createContext({ theme: 'light' });
const AuthContext = createContext({ user: null });
const LocaleContext = createContext({ locale: 'en' });

// ❌ Avoid - monolithic context
const AppContext = createContext({
  theme: 'light',
  user: null,
  locale: 'en',
  settings: {},
  // ... many more properties
});
```

### 4. Use TypeScript for Type Safety

Always use generic types for full type safety and IntelliSense support.

```typescript
// ✅ Good - explicit types
interface UserContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  login: async () => {},
  logout: () => {}
});

// ❌ Avoid - any types
const UserContext = createContext<any>({ user: null });
```

### 5. Memoize Context Values

Prevent unnecessary re-renders by memoizing context values.

```typescript
const ThemeProvider = createComponent({
  view: (state, dispatch) => {
    // ✅ Good - create value object in model or memoize
    const themeValue = {
      theme: state.theme,
      toggleTheme: () => dispatch({ type: 'TOGGLE' })
    };
    
    return createElement(
      ThemeContext.Provider,
      { value: themeValue },
      children
    );
  }
});
```

## Performance Considerations

### Context Updates

- Context values are compared by reference (===)
- Changing the value triggers all subscribers to re-render
- Keep context values immutable for predictable updates

### Subscription Performance

- Each Consumer automatically subscribes to context changes
- Subscribers are notified synchronously when values change
- Use multiple smaller contexts instead of one large context for better granularity

### Memory Management

- Context subscriptions are automatically cleaned up when components are destroyed
- The `contextUnsubscribers` array is managed automatically
- Clear the registry in tests using `contextRegistry.clear()`

## Advanced Patterns

### Compound Context Pattern

```typescript
// Create separate contexts that work together
const DataContext = createContext({ data: null });
const ActionsContext = createContext({ 
  fetchData: () => {},
  updateData: () => {}
});

// Provider combines both
const DataProvider = createComponent({
  view: (state, dispatch) => (
    <DataContext.Provider value={{ data: state.data }}>
      <ActionsContext.Provider value={{
        fetchData: () => dispatch({ type: 'FETCH' }),
        updateData: (data) => dispatch({ type: 'UPDATE', data })
      }}>
        {children}
      </ActionsContext.Provider>
    </DataContext.Provider>
  )
});
```

### Context with Reducers

```typescript
const StoreContext = createContext({
  state: {},
  dispatch: (action: any) => {}
});

const StoreProvider = createComponent({
  initialState: { count: 0, items: [] },
  
  model: (state, action) => {
    // Complex reducer logic
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      case 'ADD_ITEM':
        return { ...state, items: [...state.items, action.item] };
      default:
        return state;
    }
  },
  
  view: (state, dispatch) => (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
});
```

## Debugging

### Debug Utilities

```typescript
import { contextRegistry } from './context';

// Get subscriber count
const count = contextRegistry.getSubscriberCount(MyContext.id);
console.log(`${count} components subscribed to MyContext`);

// Get render stack depth
const depth = contextRegistry.getStackDepth();
console.log(`Current Provider nesting depth: ${depth}`);

// Clear for testing
beforeEach(() => {
  contextRegistry.clear();
});
```

### Common Issues

1. **Context value not updating**
   - Ensure you're creating a new object reference when updating
   - Check that Provider's value prop is actually changing

2. **Infinite re-render loop**
   - Don't create new objects inline in Provider value
   - Memoize or create value objects in model/state

3. **Type errors**
   - Ensure generic types match throughout Provider/Consumer chain
   - Check that default value matches the type parameter

## Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createContext, contextRegistry } from './context';

describe('MyContext', () => {
  beforeEach(() => {
    contextRegistry.clear();
  });

  it('should provide value to consumers', () => {
    const TestContext = createContext({ value: 'default' });
    
    let consumedValue;
    const app = createElement(
      TestContext.Provider,
      { value: { value: 'provided' } },
      createElement(TestContext.Consumer, {
        children: (value) => {
          consumedValue = value;
          return createElement('div');
        }
      })
    );
    
    expect(consumedValue).toEqual({ value: 'provided' });
  });
});
```

## Migration Guide

### From Placeholder to Full Implementation

The Context API has evolved from a simple placeholder to a fully functional system. If you were using the old placeholder:

**Old (Placeholder):**
```typescript
const MyContext = createContext({ value: 'default' });
// Provider and Consumer did nothing
```

**New (Full Implementation):**
```typescript
const MyContext = createContext<MyType>({ value: 'default' });
// Provider actually provides values
// Consumer subscribes and re-renders on changes
// Full TypeScript support
```

## Related Documentation

- [Components API](./components-api.md) - Component system integration
- [MVI Architecture](./mvi-api.md) - MVI pattern with context
- [VDOM API](./vdom-api.md) - Virtual DOM integration
- [Integration Guide](./integration-guide.md) - Complete framework integration

The Context API provides a powerful, type-safe way to manage global state in Marabutan applications with automatic subscription, efficient updates, and seamless component integration.
