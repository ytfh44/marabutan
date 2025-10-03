/**
 * JSX Integration Tests with MVI/Component System
 * 测试 JSX 与框架其他部分的集成
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createComponent } from './components/core';
import type { ComponentDefinition } from './components/types';
import { counterMixin, loggingMixin } from './examples/mixins';

describe('JSX Integration with Framework', () => {
  describe('JSX with createComponent', () => {
    it('should use JSX in component view function', () => {
      const TestComponent = createComponent({
        displayName: 'TestComponent',
        initialState: { count: 0 },
        model: (state, action: any) => {
          if (action.type === 'INCREMENT') {
            return { ...state, count: state.count + 1 };
          }
          return state;
        },
        view: (state) => (
          <div className="counter">
            <h2>Count: {state.count}</h2>
            <button>Increment</button>
          </div>
        )
      });

      const instance = TestComponent();
      const vnode = instance.render();

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('counter');
    });

    it('should handle state updates in JSX components', () => {
      const Counter = createComponent({
        displayName: 'Counter',
        initialState: { value: 0 },
        model: (state, action: any) => {
          if (action.type === 'ADD') {
            return { ...state, value: state.value + action.amount };
          }
          return state;
        },
        view: (state, dispatch) => (
          <div>
            <p>Value: {state.value}</p>
            <button onClick={() => dispatch && dispatch({ type: 'ADD', amount: 5 })}>
              Add 5
            </button>
          </div>
        )
      });

      const instance = Counter();
      
      const vnode1 = instance.render();
      expect(vnode1.type).toBe('div');

      instance.dispatch({ type: 'ADD', amount: 5 });
      
      const vnode2 = instance.render();
      expect(vnode2.type).toBe('div');
      expect(instance.state.value).toBe(5);
    });

    it('should handle props in JSX components', () => {
      interface Props {
        title: string;
        initialValue: number;
      }

      const Widget = createComponent<{ value: number }, Props>({
        displayName: 'Widget',
        initialState: { value: 0 },
        props: { title: '', initialValue: 0 },
        model: (state) => state,
        view: (state, dispatch, props) => (
          <div className="widget">
            <h3>{props?.title}</h3>
            <p>Value: {state.value}</p>
            <p>Initial: {props?.initialValue}</p>
          </div>
        )
      });

      const instance = Widget({ title: 'My Widget', initialValue: 10 });
      const vnode = instance.render();

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('widget');
    });

    it('should integrate with mixins', () => {
      const ComponentWithMixin = createComponent({
        displayName: 'ComponentWithMixin',
        initialState: { displayValue: 0 },
        mixins: {
          counter: counterMixin,
          logger: loggingMixin
        },
        model: (state, action: any) => {
          if (action.type === 'INCREMENT') {
            const newCounter = { count: (state.counter?.count || 0) + 1 };
            return { ...state, counter: newCounter, displayValue: newCounter.count };
          }
          return state;
        },
        view: (state, dispatch) => (
          <div className="with-mixin">
            <h2>Count: {state.displayValue}</h2>
            <button onClick={() => dispatch && dispatch({ type: 'INCREMENT' })}>
              Increment
            </button>
          </div>
        )
      });

      const instance = ComponentWithMixin();
      const vnode = instance.render();

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('with-mixin');
    });
  });

  describe('Conditional Rendering in Components', () => {
    it('should handle conditional JSX in view', () => {
      const ConditionalComponent = createComponent({
        displayName: 'ConditionalComponent',
        initialState: { show: true },
        model: (state, action: any) => {
          if (action.type === 'TOGGLE') {
            return { ...state, show: !state.show };
          }
          return state;
        },
        view: (state) => (
          <div>
            {state.show && <p>Visible content</p>}
            {!state.show && <p>Hidden content</p>}
          </div>
        )
      });

      const instance = ConditionalComponent();
      
      const vnode1 = instance.render();
      expect(vnode1.children.length).toBeGreaterThan(0);

      instance.dispatch({ type: 'TOGGLE' });
      
      const vnode2 = instance.render();
      expect(vnode2.type).toBe('div');
    });

    it('should handle ternary operators in JSX', () => {
      const TernaryComponent = createComponent({
        displayName: 'TernaryComponent',
        initialState: { isActive: true },
        model: (state, action: any) => {
          if (action.type === 'TOGGLE') {
            return { ...state, isActive: !state.isActive };
          }
          return state;
        },
        view: (state) => (
          <div className={state.isActive ? 'active' : 'inactive'}>
            {state.isActive ? <span>Active</span> : <span>Inactive</span>}
          </div>
        )
      });

      const instance = TernaryComponent();
      const vnode = instance.render();

      expect(vnode.props.className).toBe('active');
    });
  });

  describe('List Rendering in Components', () => {
    it('should render lists with map in JSX', () => {
      const ListComponent = createComponent({
        displayName: 'ListComponent',
        initialState: { items: ['apple', 'banana', 'cherry'] },
        model: (state, action: any) => {
          if (action.type === 'ADD_ITEM') {
            return { ...state, items: [...state.items, action.item] };
          }
          return state;
        },
        view: (state) => (
          <ul>
            {state.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )
      });

      const instance = ListComponent();
      const vnode = instance.render();

      expect(vnode.type).toBe('ul');
      expect(vnode.children.length).toBe(3);
    });

    it('should handle dynamic list updates', () => {
      interface TodoItem {
        id: string;
        text: string;
        completed: boolean;
      }

      const TodoList = createComponent({
        displayName: 'TodoList',
        initialState: {
          todos: [
            { id: '1', text: 'Task 1', completed: false },
            { id: '2', text: 'Task 2', completed: true }
          ] as TodoItem[]
        },
        model: (state, action: any) => {
          if (action.type === 'ADD_TODO') {
            return {
              ...state,
              todos: [...state.todos, action.todo]
            };
          }
          if (action.type === 'TOGGLE_TODO') {
            return {
              ...state,
              todos: state.todos.map(todo =>
                todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
              )
            };
          }
          return state;
        },
        view: (state, dispatch) => (
          <div className="todo-list">
            <ul>
              {state.todos.map(todo => (
                <li
                  key={todo.id}
                  className={todo.completed ? 'completed' : 'pending'}
                  onClick={() => dispatch && dispatch({ type: 'TOGGLE_TODO', id: todo.id })}
                >
                  {todo.text}
                </li>
              ))}
            </ul>
          </div>
        )
      });

      const instance = TodoList();
      const vnode1 = instance.render();

      expect(vnode1.children[0].children.length).toBe(2);

      instance.dispatch({
        type: 'ADD_TODO',
        todo: { id: '3', text: 'Task 3', completed: false }
      });

      const vnode2 = instance.render();
      expect(vnode2.children[0].children.length).toBe(3);
    });
  });

  describe('Event Handlers Integration', () => {
    it('should connect JSX event handlers to dispatch', () => {
      const ClickCounter = createComponent({
        displayName: 'ClickCounter',
        initialState: { clicks: 0 },
        model: (state, action: any) => {
          if (action.type === 'CLICK') {
            return { ...state, clicks: state.clicks + 1 };
          }
          return state;
        },
        view: (state, dispatch) => (
          <div>
            <p>Clicks: {state.clicks}</p>
            <button onClick={() => dispatch && dispatch({ type: 'CLICK' })}>
              Click me
            </button>
          </div>
        )
      });

      const instance = ClickCounter();
      const vnode = instance.render();

      expect(vnode.children[1].props.onClick).toBeDefined();
      expect(typeof vnode.children[1].props.onClick).toBe('function');
    });

    it('should handle multiple event types', () => {
      const InteractiveComponent = createComponent({
        displayName: 'InteractiveComponent',
        initialState: { 
          clicks: 0,
          hovers: 0,
          keypresses: 0
        },
        model: (state, action: any) => {
          switch (action.type) {
            case 'CLICK':
              return { ...state, clicks: state.clicks + 1 };
            case 'HOVER':
              return { ...state, hovers: state.hovers + 1 };
            case 'KEYPRESS':
              return { ...state, keypresses: state.keypresses + 1 };
            default:
              return state;
          }
        },
        view: (state, dispatch) => (
          <div
            onClick={() => dispatch && dispatch({ type: 'CLICK' })}
            onMouseEnter={() => dispatch && dispatch({ type: 'HOVER' })}
          >
            <input
              type="text"
              onKeyPress={() => dispatch && dispatch({ type: 'KEYPRESS' })}
            />
            <p>Clicks: {state.clicks}</p>
            <p>Hovers: {state.hovers}</p>
            <p>Keypresses: {state.keypresses}</p>
          </div>
        )
      });

      const instance = InteractiveComponent();
      const vnode = instance.render();

      expect(vnode.props.onClick).toBeDefined();
      expect(vnode.props.onMouseEnter).toBeDefined();
    });
  });

  describe('Form Handling Integration', () => {
    it('should handle form input with JSX', () => {
      const FormComponent = createComponent({
        displayName: 'FormComponent',
        initialState: { 
          name: '',
          email: '',
          message: ''
        },
        model: (state, action: any) => {
          if (action.type === 'UPDATE_FIELD') {
            return { ...state, [action.field]: action.value };
          }
          return state;
        },
        view: (state, dispatch) => (
          <form onSubmit={(e: any) => {
            e.preventDefault();
            dispatch && dispatch({ type: 'SUBMIT' });
          }}>
            <input
              type="text"
              value={state.name}
              onInput={(e: any) => 
                dispatch && dispatch({ 
                  type: 'UPDATE_FIELD', 
                  field: 'name', 
                  value: e.target.value 
                })
              }
            />
            <input
              type="email"
              value={state.email}
              onInput={(e: any) => 
                dispatch && dispatch({ 
                  type: 'UPDATE_FIELD', 
                  field: 'email', 
                  value: e.target.value 
                })
              }
            />
            <textarea
              value={state.message}
              onInput={(e: any) => 
                dispatch && dispatch({ 
                  type: 'UPDATE_FIELD', 
                  field: 'message', 
                  value: e.target.value 
                })
              }
            />
            <button type="submit">Submit</button>
          </form>
        )
      });

      const instance = FormComponent();
      const vnode = instance.render();

      expect(vnode.type).toBe('form');
      expect(vnode.children.length).toBe(4); // 2 inputs, 1 textarea, 1 button
    });
  });

  describe('Nested Components with JSX', () => {
    it('should handle nested component instances', () => {
      const Child = createComponent({
        displayName: 'Child',
        initialState: { value: 'child' },
        model: (state) => state,
        view: (state) => <span className="child">{state.value}</span>
      });

      const Parent = createComponent({
        displayName: 'Parent',
        initialState: { value: 'parent' },
        model: (state) => state,
        view: (state) => (
          <div className="parent">
            <h1>{state.value}</h1>
            <Child />
          </div>
        )
      });

      const parentInstance = Parent();
      const vnode = parentInstance.render();

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('parent');
    });
  });

  describe('Styling Integration', () => {
    it('should handle dynamic styles in components', () => {
      const StyledComponent = createComponent({
        displayName: 'StyledComponent',
        initialState: { color: 'red', size: 16 },
        model: (state, action: any) => {
          if (action.type === 'CHANGE_COLOR') {
            return { ...state, color: action.color };
          }
          return state;
        },
        view: (state) => (
          <div
            style={{
              color: state.color,
              fontSize: `${state.size}px`,
              padding: '10px'
            }}
          >
            Styled content
          </div>
        )
      });

      const instance = StyledComponent();
      const vnode = instance.render();

      expect(vnode.props.style.color).toBe('red');
      expect(vnode.props.style.fontSize).toBe('16px');
    });

    it('should handle conditional class names', () => {
      const ClassComponent = createComponent({
        displayName: 'ClassComponent',
        initialState: { isActive: true, isLarge: false },
        model: (state, action: any) => {
          if (action.type === 'TOGGLE_ACTIVE') {
            return { ...state, isActive: !state.isActive };
          }
          return state;
        },
        view: (state) => (
          <div
            className={`
              component
              ${state.isActive ? 'active' : 'inactive'}
              ${state.isLarge ? 'large' : 'small'}
            `.trim()}
          >
            Content
          </div>
        )
      });

      const instance = ClassComponent();
      const vnode = instance.render();

      expect(vnode.props.className).toContain('active');
      expect(vnode.props.className).toContain('small');
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should handle complete application structure', () => {
      const App = createComponent({
        displayName: 'App',
        initialState: {
          currentView: 'home' as 'home' | 'about' | 'contact',
          user: { name: 'John', isLoggedIn: true }
        },
        model: (state, action: any) => {
          if (action.type === 'NAVIGATE') {
            return { ...state, currentView: action.view };
          }
          if (action.type === 'LOGOUT') {
            return { ...state, user: { ...state.user, isLoggedIn: false } };
          }
          return state;
        },
        view: (state, dispatch) => (
          <div className="app">
            <header>
              <nav>
                <button onClick={() => dispatch && dispatch({ type: 'NAVIGATE', view: 'home' })}>
                  Home
                </button>
                <button onClick={() => dispatch && dispatch({ type: 'NAVIGATE', view: 'about' })}>
                  About
                </button>
                <button onClick={() => dispatch && dispatch({ type: 'NAVIGATE', view: 'contact' })}>
                  Contact
                </button>
              </nav>
              {state.user.isLoggedIn && (
                <div className="user-info">
                  <span>{state.user.name}</span>
                  <button onClick={() => dispatch && dispatch({ type: 'LOGOUT' })}>
                    Logout
                  </button>
                </div>
              )}
            </header>
            <main>
              {state.currentView === 'home' && <div className="home">Home Page</div>}
              {state.currentView === 'about' && <div className="about">About Page</div>}
              {state.currentView === 'contact' && <div className="contact">Contact Page</div>}
            </main>
          </div>
        )
      });

      const instance = App();
      const vnode = instance.render();

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('app');
      expect(vnode.children.length).toBe(2); // header and main
    });
  });
});

