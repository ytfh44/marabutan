# Framework Integration Guide

## Overview

This guide demonstrates how all Marabutan framework modules work together to build complete applications. You'll see how MVI architecture, Virtual DOM, JSX, components, mixins, templates, and utilities integrate seamlessly to create powerful, maintainable web applications.

## Core Concepts Integration

### MVI + Virtual DOM + JSX

The foundation: MVI manages state, Virtual DOM handles efficient updates, JSX provides declarative syntax.

```tsx
import { run } from './mvi/core';
import { createElement } from './vdom/createElement';

// Complete MVI app with JSX
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

  view: (state) => (
    <div className="counter-app">
      <h1>Counter: {state.count}</h1>
      <div className="buttons">
        <button onClick={() => ({ type: 'INCREMENT' })}>+</button>
        <button onClick={() => ({ type: 'DECREMENT' })}>-</button>
      </div>
    </div>
  ),

  rootElement: '#app'
};

run(counterApp);
```

## Component System Integration

### Components + MVI + Mixins

Components provide reusable UI building blocks, MVI handles their state, mixins add shared behavior.

```tsx
import { createComponent } from './components/core';
import { createMixin } from './mixins/core';
import { warnPerformance } from './utils/warnings';

// Mixin for form validation
const validationMixin = createMixin({
  initialState: { errors: {} },

  methods: {
    validateField: (state, dispatch, fieldName, value, rules) => {
      const errors = { ...state.errors };

      if (rules.required && !value) {
        errors[fieldName] = 'This field is required';
      } else if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[fieldName] = 'Invalid email format';
      } else {
        delete errors[fieldName];
      }

      dispatch({ type: 'SET_ERRORS', errors });
      return Object.keys(errors).length === 0;
    }
  }
});

// Form component with validation
const ContactForm = createComponent({
  displayName: 'ContactForm',

  initialState: {
    name: '',
    email: '',
    message: ''
  },

  mixins: {
    validation: validationMixin
  },

  model: (state, action) => {
    switch (action.type) {
      case 'UPDATE_FIELD':
        return { ...state, [action.field]: action.value };
      case 'SET_ERRORS':
        return { ...state, errors: action.errors };
      case 'SUBMIT':
        if (Object.keys(state.errors || {}).length === 0) {
          console.log('Form submitted:', { name: state.name, email: state.email, message: state.message });
          return { ...state, submitted: true };
        }
        return state;
      default:
        return state;
    }
  },

  view: (state, dispatch) => {
    const handleSubmit = (e) => {
      e.preventDefault();

      // Validate all fields
      const isNameValid = state.mixins.validation.methods.validateField(
        state, dispatch, 'name', state.name, { required: true }
      );
      const isEmailValid = state.mixins.validation.methods.validateField(
        state, dispatch, 'email', state.email, { required: true, email: true }
      );
      const isMessageValid = state.mixins.validation.methods.validateField(
        state, dispatch, 'message', state.message, { required: true }
      );

      if (isNameValid && isEmailValid && isMessageValid) {
        dispatch({ type: 'SUBMIT' });
      }
    };

    if (state.submitted) {
      return (
        <div className="success-message">
          <h2>Thank you for your message!</h2>
          <p>We'll get back to you soon.</p>
        </div>
      );
    }

    return (
      <form className="contact-form" onSubmit={handleSubmit}>
        <h2>Contact Us</h2>

        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={state.name}
            onChange={(e) => dispatch({
              type: 'UPDATE_FIELD',
              field: 'name',
              value: e.target.value
            })}
            className={state.errors?.name ? 'error' : ''}
          />
          {state.errors?.name && <span className="error-text">{state.errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={state.email}
            onChange={(e) => dispatch({
              type: 'UPDATE_FIELD',
              field: 'email',
              value: e.target.value
            })}
            className={state.errors?.email ? 'error' : ''}
          />
          {state.errors?.email && <span className="error-text">{state.errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            value={state.message}
            onChange={(e) => dispatch({
              type: 'UPDATE_FIELD',
              field: 'message',
              value: e.target.value
            })}
            className={state.errors?.message ? 'error' : ''}
          />
          {state.errors?.message && <span className="error-text">{state.errors.message}</span>}
        </div>

        <button type="submit" disabled={Object.keys(state.errors || {}).length > 0}>
          Send Message
        </button>
      </form>
    );
  }
});

// Use the component
const form = ContactForm();
```

## Template System Integration

### Templates + Components + MVI

Templates provide string-based rendering that integrates with components and MVI state.

```tsx
import { template, defaultFilters } from './template';
import { createComponent } from './components/core';
import { run } from './mvi/core';

// Template-based component
const UserProfile = createComponent({
  displayName: 'UserProfile',

  view: (state) => {
    // Use template for complex HTML structures
    const profileHtml = template(`
      <div class="user-profile">
        <div class="avatar">
          <img src="{{ user.avatar }}" alt="Avatar" />
        </div>
        <div class="info">
          <h2>{{ user.name | capitalize }}</h2>
          <p class="bio">{{ user.bio }}</p>
          <div class="stats">
            <span class="stat">Posts: {{ user.posts | length }}</span>
            <span class="stat">Joined: {{ user.joinDate | date }}</span>
          </div>
        </div>
      </div>
    `, { user: state.user }, { filters: defaultFilters });

    return profileHtml;
  }
});

// MVI app using template-based components
const blogApp = {
  initialState: {
    posts: [
      {
        id: 1,
        title: 'Getting Started with MVI',
        content: 'MVI architecture provides clean separation of concerns...',
        author: 'John Doe',
        date: '2024-01-15',
        tags: ['javascript', 'architecture', 'frontend']
      },
      {
        id: 2,
        title: 'Virtual DOM Explained',
        content: 'Virtual DOM enables efficient UI updates...',
        author: 'Jane Smith',
        date: '2024-01-20',
        tags: ['virtual-dom', 'performance', 'react']
      }
    ],
    selectedTag: null
  },

  model: (state, action) => {
    switch (action.type) {
      case 'FILTER_BY_TAG':
        return { ...state, selectedTag: action.tag };
      case 'CLEAR_FILTER':
        return { ...state, selectedTag: null };
      default:
        return state;
    }
  },

  view: (state) => {
    const filteredPosts = state.selectedTag
      ? state.posts.filter(post => post.tags.includes(state.selectedTag))
      : state.posts;

    // Use templates for complex list rendering
    const postsHtml = template(`
      <div class="posts">
        @for post in posts
          <article class="post">
            <header>
              <h2>{{ post.title }}</h2>
              <div class="meta">
                <span class="author">By {{ post.author }}</span>
                <span class="date">{{ post.date | date }}</span>
              </div>
            </header>
            <div class="content">
              {{ post.content | truncate:150 }}
            </div>
            <footer>
              <div class="tags">
                @for tag in post.tags
                  <span class="tag">{{ tag }}</span>
                @endfor
              </div>
            </footer>
          </article>
        @endfor
      </div>
    `, { posts: filteredPosts }, { filters: defaultFilters });

    // Combine templates with JSX components
    return (
      <div className="blog-app">
        <header className="app-header">
          <h1>My Blog</h1>
          <nav className="tag-filter">
            <button
              className={state.selectedTag === null ? 'active' : ''}
              onClick={() => ({ type: 'CLEAR_FILTER' })}
            >
              All Posts
            </button>
            {Array.from(new Set(state.posts.flatMap(p => p.tags))).map(tag => (
              <button
                key={tag}
                className={state.selectedTag === tag ? 'active' : ''}
                onClick={() => ({ type: 'FILTER_BY_TAG', tag })}
              >
                {tag}
              </button>
            ))}
          </nav>
        </header>

        <main className="app-content">
          {postsHtml}
        </main>
      </div>
    );
  },

  rootElement: '#app'
};

run(blogApp);
```

## Advanced Integration Patterns

### Complex Application with All Systems

Here's a complete e-commerce dashboard showing all systems working together:

```tsx
import { run } from './mvi/core';
import { createComponent } from './components/core';
import { createMixin } from './mixins/core';
import { template, defaultFilters } from './template';
import { warnPerformance, isDevelopment } from './utils/warnings';

// Mixin for data fetching
const apiMixin = createMixin({
  initialState: { loading: false, error: null },

  methods: {
    fetchData: async (state, dispatch, url) => {
      dispatch({ type: 'SET_LOADING', loading: true, error: null });

      try {
        const response = await fetch(url);
        const data = await response.json();
        dispatch({ type: 'SET_DATA', data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }
  }
});

// Product card component
const ProductCard = createComponent({
  displayName: 'ProductCard',

  props: {
    product: {} as any
  },

  view: (state, props) => (
    <div className="product-card">
      <img src={props.product.image} alt={props.product.name} />
      <div className="product-info">
        <h3>{props.product.name}</h3>
        <p className="price">${props.product.price}</p>
        <div className="rating">
          {'★'.repeat(Math.floor(props.product.rating))}
          <span>({props.product.reviews} reviews)</span>
        </div>
      </div>
      <button
        className="add-to-cart"
        onClick={() => ({ type: 'ADD_TO_CART', product: props.product })}
      >
        Add to Cart
      </button>
    </div>
  )
});

// Dashboard component with templates and mixins
const Dashboard = createComponent({
  displayName: 'Dashboard',

  initialState: {
    products: [],
    cart: [],
    user: { name: 'John Doe', avatar: '/avatar.jpg' }
  },

  mixins: {
    api: apiMixin
  },

  model: (state, action) => {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, loading: action.loading, error: action.error };
      case 'SET_DATA':
        return { ...state, products: action.data, loading: false };
      case 'SET_ERROR':
        return { ...state, error: action.error, loading: false };
      case 'ADD_TO_CART':
        return {
          ...state,
          cart: [...state.cart, action.product],
          products: state.products.map(p =>
            p.id === action.product.id ? { ...p, inCart: true } : p
          )
        };
      default:
        return state;
    }
  },

  lifecycle: {
    created: (state, dispatch) => {
      // Fetch products on component creation
      state.mixins.api.methods.fetchData(state, dispatch, '/api/products');
    }
  },

  view: (state, dispatch) => {
    // Performance monitoring
    if (isDevelopment() && state.products.length > 100) {
      warnPerformance('Large product list detected', 'Consider pagination');
    }

    // Template for user info section
    const userInfo = template(`
      <div class="user-info">
        <img src="{{ user.avatar }}" alt="Avatar" class="avatar" />
        <div class="user-details">
          <h2>Welcome back, {{ user.name | capitalize }}</h2>
          <p>You have {{ cart | length }} items in your cart</p>
        </div>
      </div>
    `, { user: state.user, cart: state.cart }, { filters: defaultFilters });

    // Template for cart summary
    const cartSummary = state.cart.length > 0 ? template(`
      <div class="cart-summary">
        <h3>Cart Summary</h3>
        <ul class="cart-items">
          @for item in cart
            <li>{{ item.name }} - ${{ item.price }}</li>
          @endfor
        </ul>
        <p class="total">Total: ${{ cart | sum:'price' | number:2 }}</p>
      </div>
    `, { cart: state.cart }, { filters: defaultFilters }) : null;

    if (state.loading) {
      return (
        <div className="dashboard loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="dashboard error">
          <h2>Error loading products</h2>
          <p>{state.error}</p>
          <button onClick={() => state.mixins.api.methods.fetchData(state, dispatch, '/api/products')}>
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="dashboard">
        {userInfo}

        <div className="dashboard-content">
          <div className="products-section">
            <h2>Featured Products</h2>
            <div className="products-grid">
              {state.products.slice(0, 6).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {cartSummary && (
            <aside className="cart-sidebar">
              {cartSummary}
            </aside>
          )}
        </div>
      </div>
    );
  }
});

// Main application
const eCommerceApp = {
  initialState: {
    currentView: 'dashboard',
    user: { name: 'John Doe', avatar: '/avatar.jpg' }
  },

  view: (state) => {
    switch (state.currentView) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return <div>Unknown view</div>;
    }
  },

  rootElement: '#app'
};

run(eCommerceApp);
```

## Real-time Application with WebSockets

### WebSocket Integration + MVI + Components

```tsx
import { run } from './mvi/core';
import { createComponent } from './components/core';
import { createMixin } from './mixins/core';
import { warnPerformance } from './utils/warnings';

// WebSocket mixin for real-time updates
const websocketMixin = createMixin({
  initialState: { connected: false, socket: null },

  lifecycle: {
    created: (state, dispatch) => {
      try {
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () => {
          dispatch({ type: 'WS_CONNECTED', socket });
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          dispatch({ type: 'WS_MESSAGE', data });
        };

        socket.onclose = () => {
          dispatch({ type: 'WS_DISCONNECTED' });
        };

        socket.onerror = (error) => {
          dispatch({ type: 'WS_ERROR', error });
        };
      } catch (error) {
        dispatch({ type: 'WS_ERROR', error });
      }
    },

    destroyed: (state) => {
      if (state.socket) {
        state.socket.close();
      }
    }
  },

  methods: {
    sendMessage: (state, dispatch, message) => {
      if (state.socket && state.socket.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify(message));
      }
    }
  }
});

// Real-time chat component
const ChatRoom = createComponent({
  displayName: 'ChatRoom',

  initialState: {
    messages: [],
    newMessage: '',
    users: []
  },

  mixins: {
    ws: websocketMixin
  },

  model: (state, action) => {
    switch (action.type) {
      case 'WS_CONNECTED':
        return { ...state, connected: true, socket: action.socket };
      case 'WS_DISCONNECTED':
        return { ...state, connected: false, socket: null };
      case 'WS_MESSAGE':
        if (action.data.type === 'message') {
          return {
            ...state,
            messages: [...state.messages, action.data.message]
          };
        } else if (action.data.type === 'user_joined') {
          return {
            ...state,
            users: [...state.users, action.data.user]
          };
        } else if (action.data.type === 'user_left') {
          return {
            ...state,
            users: state.users.filter(u => u.id !== action.data.userId)
          };
        }
        return state;
      case 'UPDATE_MESSAGE':
        return { ...state, newMessage: action.value };
      case 'SEND_MESSAGE':
        if (state.newMessage.trim()) {
          state.mixins.ws.methods.sendMessage(state, () => {}, {
            type: 'message',
            content: state.newMessage.trim(),
            timestamp: Date.now()
          });
          return { ...state, newMessage: '' };
        }
        return state;
      default:
        return state;
    }
  },

  view: (state, dispatch) => {
    const handleSubmit = (e) => {
      e.preventDefault();
      dispatch({ type: 'SEND_MESSAGE' });
    };

    return (
      <div className="chat-room">
        <div className="chat-header">
          <h2>Chat Room</h2>
          <div className={`connection-status ${state.connected ? 'connected' : 'disconnected'}`}>
            {state.connected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>

        <div className="chat-users">
          <h3>Online Users ({state.users.length})</h3>
          <ul>
            {state.users.map(user => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        </div>

        <div className="chat-messages">
          {state.messages.map((message, index) => (
            <div key={index} className="message">
              <strong>{message.user}:</strong> {message.content}
              <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={state.newMessage}
            onChange={(e) => dispatch({ type: 'UPDATE_MESSAGE', value: e.target.value })}
            placeholder="Type a message..."
            disabled={!state.connected}
          />
          <button type="submit" disabled={!state.connected || !state.newMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    );
  }
});

// Real-time dashboard with multiple components
const realtimeApp = {
  initialState: {
    activeTab: 'chat'
  },

  view: (state) => (
    <div className="realtime-app">
      <nav className="app-nav">
        <button
          className={state.activeTab === 'chat' ? 'active' : ''}
          onClick={() => ({ type: 'SWITCH_TAB', tab: 'chat' })}
        >
          Chat
        </button>
        <button
          className={state.activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => ({ type: 'SWITCH_TAB', tab: 'dashboard' })}
        >
          Dashboard
        </button>
      </nav>

      <main className="app-content">
        {state.activeTab === 'chat' && <ChatRoom />}
        {state.activeTab === 'dashboard' && <Dashboard />}
      </main>
    </div>
  ),

  rootElement: '#app'
};

run(realtimeApp);
```

## Testing Integration

### Component Testing with All Systems

```tsx
import { createComponent } from './components/core';
import { createMixin } from './mixins/core';
import { template } from './template';
import { clearWarnings } from './utils/warnings';

// Test utilities
const testComponent = (component, initialProps = {}) => {
  const instance = component(initialProps);
  return {
    instance,
    render: () => instance.render(),
    dispatch: (action) => instance.dispatch(action),
    getState: () => instance.state,
    updateProps: (props) => instance.updateProps(props)
  };
};

// Component under test
const TodoItem = createComponent({
  displayName: 'TodoItem',

  initialState: { completed: false },

  mixins: {
    logger: createMixin({
      methods: {
        logAction: (state, dispatch, action) => {
          console.log(`TodoItem action: ${action}`);
        }
      }
    })
  },

  model: (state, action) => {
    switch (action.type) {
      case 'TOGGLE':
        return { ...state, completed: !state.completed };
      default:
        return state;
    }
  },

  view: (state) => template(`
    <div class="todo-item {{ completed ? 'completed' : '' }}">
      <input type="checkbox" checked="{{ completed }}" />
      <span>{{ text }}</span>
      <button class="delete">×</button>
    </div>
  `, { completed: state.completed, text: 'Test todo' })
});

// Tests
describe('TodoItem Integration', () => {
  beforeEach(() => {
    clearWarnings(); // Clear any previous warnings
  });

  it('should render initial state', () => {
    const { render } = testComponent(TodoItem);

    const vnode = render();
    expect(vnode.type).toBe('div');
    expect(vnode.props.className).toContain('todo-item');
  });

  it('should toggle completion state', () => {
    const { dispatch, getState } = testComponent(TodoItem);

    expect(getState().completed).toBe(false);

    dispatch({ type: 'TOGGLE' });
    expect(getState().completed).toBe(true);

    dispatch({ type: 'TOGGLE' });
    expect(getState().completed).toBe(false);
  });

  it('should integrate mixin methods', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    const { instance } = testComponent(TodoItem);

    // Access mixin method
    instance.getMixedState().mixins.logger.methods.logAction(
      instance.state, () => {}, 'test action'
    );

    expect(spy).toHaveBeenCalledWith('TodoItem action: test action');
    spy.mockRestore();
  });

  it('should render with template system', () => {
    const { render } = testComponent(TodoItem);

    const vnode = render();
    expect(vnode.children).toContain('Test todo');
  });
});
```

## Performance Optimization Integration

### Lazy Loading + Code Splitting

```tsx
import { createComponent } from './components/core';
import { warnPerformance } from './utils/warnings';

// Lazy loading mixin
const lazyMixin = createMixin({
  initialState: { loaded: false, loading: false },

  methods: {
    loadComponent: async (state, dispatch, componentName) => {
      if (state.loaded) return;

      dispatch({ type: 'SET_LOADING', loading: true });

      try {
        // Dynamic import for code splitting
        const module = await import(`./components/${componentName}`);
        dispatch({ type: 'SET_COMPONENT', component: module.default });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false });
      }
    }
  }
});

// Lazy-loaded component wrapper
const LazyComponent = createComponent({
  displayName: 'LazyComponent',

  props: {
    componentName: '' as string,
    fallback: null as any
  },

  mixins: {
    lazy: lazyMixin
  },

  model: (state, action) => {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, loading: action.loading };
      case 'SET_COMPONENT':
        return { ...state, loaded: true, Component: action.component };
      case 'SET_ERROR':
        return { ...state, error: action.error };
      default:
        return state;
    }
  },

  lifecycle: {
    created: (state, dispatch, props) => {
      // Start loading component when created
      state.mixins.lazy.methods.loadComponent(state, dispatch, props.componentName);
    }
  },

  view: (state, props) => {
    if (state.error) {
      return (
        <div className="error">
          Failed to load component: {state.error}
        </div>
      );
    }

    if (state.loading) {
      return props.fallback || <div className="loading">Loading...</div>;
    }

    if (state.loaded && state.Component) {
      return <state.Component {...props} />;
    }

    return null;
  }
});

// Usage in main app
const App = createComponent({
  view: (state) => (
    <div className="app">
      <h1>My App</h1>

      {/* Lazy load heavy components */}
      <LazyComponent
        componentName="HeavyDashboard"
        fallback={<div>Loading dashboard...</div>}
      />

      <LazyComponent
        componentName="DataTable"
        fallback={<div>Loading data table...</div>}
      />
    </div>
  )
});
```

## Best Practices for Integration

### 1. Layer Separation

```tsx
// Good: Clear separation of concerns
const DataLayer = {
  // Pure data operations
  fetchUsers: () => fetch('/api/users').then(r => r.json()),
  saveUser: (user) => fetch('/api/users', { method: 'POST', body: JSON.stringify(user) })
};

const BusinessLogic = {
  // State transformations
  validateUser: (user) => {
    // Validation logic
    return errors;
  },
  processUserData: (rawData) => {
    // Data processing
    return processedData;
  }
};

const UIComponents = {
  // Pure UI components
  UserForm: createComponent({ /* form logic */ }),
  UserList: createComponent({ /* list logic */ })
};

// Integration in MVI app
const userManagementApp = {
  initialState: { users: [], formData: {} },

  model: (state, action) => {
    switch (action.type) {
      case 'LOAD_USERS':
        return { ...state, loading: true };
      case 'USERS_LOADED':
        return {
          ...state,
          users: BusinessLogic.processUserData(action.users),
          loading: false
        };
      // ... more actions
    }
  },

  view: (state) => (
    <div className="user-management">
      <UIComponents.UserForm formData={state.formData} />
      <UIComponents.UserList users={state.users} />
    </div>
  )
};
```

### 2. Error Boundaries with All Systems

```tsx
import { createComponent } from './components/core';
import { createMixin } from './mixins/core';
import { warn } from './utils/warnings';

// Error boundary mixin
const errorBoundaryMixin = createMixin({
  initialState: { hasError: false, error: null, errorInfo: null },

  lifecycle: {
    created: (state, dispatch) => {
      // Set up global error handler
      window.addEventListener('error', (event) => {
        dispatch({ type: 'ERROR_OCCURRED', error: event.error, errorInfo: event });
      });

      window.addEventListener('unhandledrejection', (event) => {
        dispatch({ type: 'ERROR_OCCURRED', error: event.reason, errorInfo: event });
      });
    }
  },

  methods: {
    resetError: (state, dispatch) => {
      dispatch({ type: 'RESET_ERROR' });
    }
  }
});

// Error boundary component
const ErrorBoundary = createComponent({
  displayName: 'ErrorBoundary',

  props: {
    fallback: null as any,
    children: null as any
  },

  mixins: {
    boundary: errorBoundaryMixin
  },

  model: (state, action) => {
    switch (action.type) {
      case 'ERROR_OCCURRED':
        warn('ERROR', `Component error: ${action.error.message}`);
        return {
          ...state,
          hasError: true,
          error: action.error,
          errorInfo: action.errorInfo
        };
      case 'RESET_ERROR':
        return { ...state, hasError: false, error: null, errorInfo: null };
      default:
        return state;
    }
  },

  view: (state, props) => {
    if (state.hasError) {
      if (props.fallback) {
        return props.fallback(state.error, state.errorInfo);
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{state.error?.stack}</pre>
          </details>
          <button onClick={() => state.mixins.boundary.methods.resetError(state, () => {})}>
            Try Again
          </button>
        </div>
      );
    }

    return props.children;
  }
});

// Usage
const SafeApp = () => (
  <ErrorBoundary
    fallback={(error, info) => (
      <div className="custom-error">
        <h2>Application Error</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Reload App
        </button>
      </div>
    )}
  >
    <MainApp />
  </ErrorBoundary>
);
```

### 3. Performance Monitoring Integration

```tsx
import { createComponent } from './components/core';
import { warnPerformance, checkTreeDepth } from './utils/warnings';

// Performance monitoring component
const PerformanceMonitor = createComponent({
  displayName: 'PerformanceMonitor',

  initialState: {
    metrics: {
      renderCount: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
      componentCount: 0
    }
  },

  lifecycle: {
    beforeRender: (state) => {
      state.metrics.renderCount++;
      state.renderStartTime = performance.now();
    },

    afterRender: (state, vnode) => {
      const renderTime = performance.now() - state.renderStartTime;

      if (renderTime > 16) { // Slower than 60fps
        warnPerformance('Slow render detected', `${renderTime.toFixed(2)}ms`);
      }

      // Update metrics
      const metrics = { ...state.metrics };
      metrics.averageRenderTime = (metrics.averageRenderTime + renderTime) / 2;
      metrics.maxRenderTime = Math.max(metrics.maxRenderTime, renderTime);

      return { ...state, metrics };
    }
  },

  view: (state) => (
    <div className="performance-monitor">
      <h3>Performance Metrics</h3>
      <div className="metrics">
        <div>Renders: {state.metrics.renderCount}</div>
        <div>Avg Render Time: {state.metrics.averageRenderTime.toFixed(2)}ms</div>
        <div>Max Render Time: {state.metrics.maxRenderTime.toFixed(2)}ms</div>
        <div>Components: {state.metrics.componentCount}</div>
      </div>
    </div>
  )
});

// Integration in main app
const monitoredApp = {
  initialState: { showMetrics: false },

  view: (state) => (
    <div className="app">
      <button onClick={() => ({ type: 'TOGGLE_METRICS' })}>
        {state.showMetrics ? 'Hide' : 'Show'} Performance Metrics
      </button>

      <MainContent />

      {state.showMetrics && <PerformanceMonitor />}
    </div>
  )
};
```

This integration guide demonstrates how Marabutan's modular architecture enables building complex, scalable applications with clean separation of concerns, excellent performance, and great developer experience.
