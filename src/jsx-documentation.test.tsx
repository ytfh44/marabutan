/**
 * JSX Documentation Validation Tests
 * 验证文档中的所有示例都能正确运行
 */

import { describe, it, expect } from 'vitest';
import { Fragment } from './jsx-runtime';
import { createElement } from './vdom/createElement';
import type { FunctionComponent } from './jsx.d';
import type { VNode } from './vdom/types';

describe('JSX Documentation Examples', () => {
  describe('Basic Usage Examples from docs/jsx-tsx-guide.md', () => {
    it('should render simple element', () => {
      // 基本元素
      const element = <div>Hello World</div>;

      expect(element.type).toBe('div');
    });

    it('should render element with attributes', () => {
      // 带属性的元素
      const styledElement = <div className="container" id="main">Content</div>;

      expect(styledElement.type).toBe('div');
      expect(styledElement.props.className).toBe('container');
      expect(styledElement.props.id).toBe('main');
    });

    it('should render self-closing element', () => {
      // 自闭合元素
      const input = <input type="text" placeholder="Enter text" />;

      expect(input.type).toBe('input');
      expect(input.props.type).toBe('text');
      expect(input.props.placeholder).toBe('Enter text');
    });
  });

  describe('Nested Elements Examples', () => {
    it('should render nested structure', () => {
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

      expect(nestedElement.type).toBe('div');
      expect(nestedElement.children.length).toBe(3);
    });
  });

  describe('JavaScript Expressions Examples', () => {
    it('should handle expressions in JSX', () => {
      const name = 'World';
      const count = 42;

      const element = (
        <div>
          <h1>Hello {name}!</h1>
          <p>Count: {count}</p>
          <p>Double: {count * 2}</p>
        </div>
      );

      expect(element.type).toBe('div');
      expect(element.children.length).toBe(3);
    });
  });

  describe('Fragment Examples', () => {
    it('should render Fragment with multiple children', () => {
      const list = (
        <Fragment>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </Fragment>
      );

      expect(list.type).toBe(Fragment);
      expect(list.children.length).toBe(3);
    });

    it('should render Fragment with short syntax', () => {
      const list = (
        <>
          <li>Item 1</li>
          <li>Item 2</li>
        </>
      );

      expect(list.children.length).toBeGreaterThan(0);
    });
  });

  describe('Function Component Examples from docs', () => {
    it('should render basic function component', () => {
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

      const app = <Button label="Click me" onClick={() => console.log('Clicked!')} />;

      expect(app.type).toBe('button');
      expect(app.props.className).toBe('btn');
    });

    it('should render component with children', () => {
      interface CardProps {
        title: string;
        children?: VNode | VNode[];
      }

      const Card: FunctionComponent<CardProps> = (props) => {
        return (
          <div className="card">
            <div className="card-header">
              <h3>{props.title}</h3>
            </div>
            <div className="card-body">
              {props.children}
            </div>
          </div>
        );
      };

      const app = (
        <Card title="My Card">
          <p>This is the card content</p>
        </Card>
      );

      expect(app.type).toBe('div');
      expect(app.props.className).toBe('card');
    });
  });

  describe('List Rendering Examples', () => {
    it('should render list with map', () => {
      const items = ['Apple', 'Banana', 'Cherry'];

      const list = (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

      expect(list.type).toBe('ul');
      expect(list.children.length).toBe(3);
    });

    it('should render list with keys', () => {
      interface Item {
        id: string;
        name: string;
      }

      const items: Item[] = [
        { id: '1', name: 'First' },
        { id: '2', name: 'Second' },
        { id: '3', name: 'Third' }
      ];

      const list = (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      );

      expect(list.type).toBe('ul');
      expect(list.children.length).toBe(3);
      expect(list.children[0].key).toBe('1');
    });
  });

  describe('Conditional Rendering Examples', () => {
    it('should handle conditional with &&', () => {
      const isLoggedIn = true;
      const username = 'John';

      const greeting = (
        <div>
          {isLoggedIn && <p>Welcome, {username}!</p>}
        </div>
      );

      expect(greeting.type).toBe('div');
      expect(greeting.children.length).toBeGreaterThan(0);
    });

    it('should handle ternary operator', () => {
      const isOnline = false;

      const status = (
        <div>
          {isOnline ? <span>User is online</span> : <span>User is offline</span>}
        </div>
      );

      expect(status.type).toBe('div');
      expect(status.children.length).toBe(1);
    });
  });

  describe('Style Handling Examples from docs', () => {
    it('should handle style object', () => {
      const styles = {
        color: 'red',
        fontSize: '16px',
        fontWeight: 'bold'
      };

      const element = <div style={styles}>Styled content</div>;

      expect(element.props.style).toEqual(styles);
    });

    it('should handle inline styles', () => {
      const element = (
        <div style={{ color: 'blue', padding: '10px' }}>
          Styled content
        </div>
      );

      expect(element.props.style).toEqual({ color: 'blue', padding: '10px' });
    });
  });

  describe('Form Elements Examples from docs', () => {
    it('should handle input element', () => {
      const value = 'test';
      const setValue = (newValue: string) => {};

      const input = (
        <input
          type="text"
          value={value}
          onChange={(e: Event) => setValue((e.target as HTMLInputElement).value)}
          placeholder="Enter text"
        />
      );

      expect(input.type).toBe('input');
      expect(input.props.value).toBe('test');
    });

    it('should handle checkbox', () => {
      const isChecked = true;
      const setIsChecked = (checked: boolean) => {};

      const checkbox = (
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        />
      );

      expect(checkbox.props.type).toBe('checkbox');
      expect(checkbox.props.checked).toBe(true);
    });

    it('should handle select element', () => {
      const selectedValue = 'option2';
      const handleChange = () => {};

      const select = (
        <select value={selectedValue} onChange={handleChange}>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
      );

      expect(select.type).toBe('select');
      expect(select.props.value).toBe('option2');
      expect(select.children.length).toBe(3);
    });
  });

  describe('Data and ARIA Attributes Examples', () => {
    it('should handle data attributes', () => {
      const element = (
        <div 
          data-testid="my-element"
          data-value="123"
        >
          Content
        </div>
      );

      expect(element.props['data-testid']).toBe('my-element');
      expect(element.props['data-value']).toBe('123');
    });

    it('should handle aria attributes', () => {
      const handleClose = () => {};

      const button = (
        <button
          aria-label="Close"
          aria-pressed="false"
          onClick={handleClose}
        >
          ×
        </button>
      );

      expect(button.props['aria-label']).toBe('Close');
      expect(button.props['aria-pressed']).toBe('false');
    });
  });

  describe('SVG Support Examples from docs', () => {
    it('should render SVG icon', () => {
      const icon = (
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="blue" />
          <path d="M12 2 L12 22" stroke="white" strokeWidth="2" />
        </svg>
      );

      expect(icon.type).toBe('svg');
      expect(icon.props.width).toBe('24');
      expect(icon.props.viewBox).toBe('0 0 24 24');
      expect(icon.children.length).toBe(2);
    });
  });

  describe('README.md Examples', () => {
    it('should validate JSX Runtime example', () => {
      // JSX is automatically transformed to jsx() calls
      const element = (
        <div className="container">
          <h1>Title</h1>
          <p>Content</p>
        </div>
      );

      expect(element.type).toBe('div');
      expect(element.props.className).toBe('container');
      expect(element.children.length).toBe(2);
    });

    it('should validate Fragment example', () => {
      const fragment = (
        <Fragment>
          <div>Item 1</div>
          <div>Item 2</div>
        </Fragment>
      );

      expect(fragment.type).toBe(Fragment);
      expect(fragment.children.length).toBe(2);
    });

    it('should validate Function Component example', () => {
      interface ButtonProps {
        label: string;
        onClick: () => void;
      }

      const Button: FunctionComponent<ButtonProps> = ({ label, onClick }) => (
        <button className="btn" onClick={onClick}>
          {label}
        </button>
      );

      const vnode = <Button label="Click" onClick={() => {}} />;

      expect(vnode.type).toBe('button');
      expect(vnode.props.className).toBe('btn');
    });
  });

  describe('Complex Examples from Documentation', () => {
    it('should handle complete page structure', () => {
      const page = (
        <div className="app">
          <header>
            <nav>
              <a href="/">Home</a>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
            </nav>
          </header>
          <main>
            <section>
              <h1>Welcome</h1>
              <p>This is the main content</p>
            </section>
          </main>
          <footer>
            <p>© 2024 My App</p>
          </footer>
        </div>
      );

      expect(page.type).toBe('div');
      expect(page.props.className).toBe('app');
      expect(page.children.length).toBe(3); // header, main, footer
    });

    it('should handle complex form example', () => {
      const form = (
        <form>
          <div>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" required />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" required />
          </div>
          <div>
            <label htmlFor="message">Message:</label>
            <textarea id="message" rows={5} />
          </div>
          <button type="submit">Submit</button>
        </form>
      );

      expect(form.type).toBe('form');
      expect(form.children.length).toBe(4);
    });

    it('should handle nested list example', () => {
      const nestedList = (
        <ul>
          <li>
            Item 1
            <ul>
              <li>Subitem 1.1</li>
              <li>Subitem 1.2</li>
            </ul>
          </li>
          <li>
            Item 2
            <ul>
              <li>Subitem 2.1</li>
              <li>Subitem 2.2</li>
            </ul>
          </li>
        </ul>
      );

      expect(nestedList.type).toBe('ul');
      expect(nestedList.children.length).toBe(2);
    });

    it('should handle table example', () => {
      const table = (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>30</td>
              <td>john@example.com</td>
            </tr>
            <tr>
              <td>Jane Smith</td>
              <td>25</td>
              <td>jane@example.com</td>
            </tr>
          </tbody>
        </table>
      );

      expect(table.type).toBe('table');
      expect(table.children.length).toBe(2); // thead and tbody
    });
  });

  describe('Edge Cases from Documentation', () => {
    it('should handle empty elements', () => {
      const empty = <div></div>;

      expect(empty.type).toBe('div');
      expect(empty.children.length).toBe(0);
    });

    it('should handle elements with only whitespace', () => {
      const whitespace = <div>   </div>;

      expect(whitespace.type).toBe('div');
    });

    it('should handle deeply nested structures', () => {
      const deep = (
        <div>
          <div>
            <div>
              <div>
                <span>Deep content</span>
              </div>
            </div>
          </div>
        </div>
      );

      expect(deep.type).toBe('div');
    });
  });

  describe('TypeScript Type Examples from Documentation', () => {
    it('should type check props correctly', () => {
      interface UserProps {
        name: string;
        age: number;
        email?: string;
      }

      const UserCard: FunctionComponent<UserProps> = (props) => (
        <div className="user-card">
          <h3>{props.name}</h3>
          <p>Age: {props.age}</p>
          {props.email && <p>Email: {props.email}</p>}
        </div>
      );

      const user = <UserCard name="John" age={30} />;

      expect(user.type).toBe('div');
    });

    it('should support generic components', () => {
      interface ListProps<T> {
        items: T[];
        renderItem: (item: T) => VNode;
      }

      function List<T>(props: ListProps<T>): VNode {
        return (
          <ul>
            {props.items.map((item, index) => (
              <li key={index}>{props.renderItem(item)}</li>
            ))}
          </ul>
        );
      }

      const stringList = (
        <List
          items={['a', 'b', 'c']}
          renderItem={(item) => <span>{item}</span>}
        />
      );

      expect(stringList.type).toBe('ul');
    });
  });

  describe('Event Handler Examples from Documentation', () => {
    it('should handle onClick', () => {
      const handleClick = (event: MouseEvent) => {
        console.log('Clicked at', event.clientX, event.clientY);
      };

      const button = <button onClick={handleClick}>Click me</button>;

      expect(button.props.onClick).toBe(handleClick);
    });

    it('should handle multiple event types', () => {
      const handleClick = () => {};
      const handleHover = () => {};
      const handleKeyPress = () => {};

      const interactive = (
        <div
          onClick={handleClick}
          onMouseEnter={handleHover}
          onKeyPress={handleKeyPress}
        >
          Interactive element
        </div>
      );

      expect(interactive.props.onClick).toBe(handleClick);
      expect(interactive.props.onMouseEnter).toBe(handleHover);
      expect(interactive.props.onKeyPress).toBe(handleKeyPress);
    });
  });

  describe('Best Practices from Documentation', () => {
    it('should use keys in lists', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ];

      const list = (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      );

      expect(list.children.every(child => child.key !== undefined)).toBe(true);
    });

    it('should use semantic HTML', () => {
      const page = (
        <div>
          <header>
            <nav>Navigation</nav>
          </header>
          <main>
            <article>
              <h1>Article Title</h1>
              <p>Article content</p>
            </article>
          </main>
          <footer>Footer content</footer>
        </div>
      );

      expect(page.children[0].type).toBe('header');
      expect(page.children[1].type).toBe('main');
      expect(page.children[2].type).toBe('footer');
    });

    it('should use accessibility attributes', () => {
      const accessibleButton = (
        <button
          aria-label="Close dialog"
          aria-pressed="false"
          onClick={() => {}}
        >
          ×
        </button>
      );

      expect(accessibleButton.props['aria-label']).toBe('Close dialog');
      expect(accessibleButton.props['aria-pressed']).toBe('false');
    });
  });
});

