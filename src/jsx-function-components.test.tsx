/**
 * JSX Function Components Tests
 * 测试函数组件的各种场景和模式
 */

import { describe, it, expect } from 'vitest';
import type { FunctionComponent } from './jsx.d';
import type { VNode } from './vdom/types';

describe('JSX Function Components', () => {
  describe('Basic Function Components', () => {
    it('should render simple function component', () => {
      const SimpleComponent: FunctionComponent = () => {
        return <div>Simple Component</div>;
      };

      const vnode = <SimpleComponent />;

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should render function component with props', () => {
      interface ButtonProps {
        label: string;
        type?: string;
      }

      const Button: FunctionComponent<ButtonProps> = (props) => {
        return <button type={props.type || 'button'}>{props.label}</button>;
      };

      const vnode = <Button label="Click me" type="submit" />;

      expect(vnode.type).toBe('button');
      expect(vnode.props.type).toBe('submit');
    });

    it('should render function component with children', () => {
      interface CardProps {
        title: string;
        children?: any;
      }

      const Card: FunctionComponent<CardProps> = (props) => {
        return (
          <div className="card">
            <h2>{props.title}</h2>
            <div className="card-content">{props.children}</div>
          </div>
        );
      };

      const vnode = (
        <Card title="My Card">
          <p>Card content</p>
        </Card>
      );

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('card');
      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle function component returning null', () => {
      const NullComponent: FunctionComponent = () => {
        return null;
      };

      const vnode = <NullComponent />;

      expect(vnode.type).toBe('');
      expect(vnode.children).toEqual(['']);
    });

    it('should handle function component returning undefined', () => {
      const UndefinedComponent: FunctionComponent = () => {
        return undefined as any;
      };

      const vnode = <UndefinedComponent />;

      expect(vnode.type).toBe('');
    });
  });

  describe('Nested Function Components', () => {
    it('should render nested function components', () => {
      const Inner: FunctionComponent = () => <span>Inner</span>;
      const Outer: FunctionComponent = () => (
        <div>
          <Inner />
        </div>
      );

      const vnode = <Outer />;

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should render deeply nested components', () => {
      const Level3: FunctionComponent = () => <span>Level 3</span>;
      const Level2: FunctionComponent = () => (
        <div>
          <Level3 />
        </div>
      );
      const Level1: FunctionComponent = () => (
        <section>
          <Level2 />
        </section>
      );

      const vnode = <Level1 />;

      expect(vnode.type).toBe('section');
    });

    it('should handle multiple nested components', () => {
      const Item: FunctionComponent<{ text: string }> = (props) => (
        <li>{props.text}</li>
      );

      const List: FunctionComponent = () => (
        <ul>
          <Item text="First" />
          <Item text="Second" />
          <Item text="Third" />
        </ul>
      );

      const vnode = <List />;

      expect(vnode.type).toBe('ul');
      expect(vnode.children.length).toBe(3);
    });
  });

  describe('Components as Props', () => {
    it('should accept component as prop', () => {
      interface ContainerProps {
        header: FunctionComponent;
        children?: any;
      }

      const Header: FunctionComponent = () => <h1>Header</h1>;

      const Container: FunctionComponent<ContainerProps> = (props) => {
        const HeaderComponent = props.header;
        return (
          <div>
            <HeaderComponent />
            {props.children}
          </div>
        );
      };

      const vnode = (
        <Container header={Header}>
          <p>Content</p>
        </Container>
      );

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle render prop pattern', () => {
      interface ListProps {
        items: string[];
        renderItem: (item: string) => VNode;
      }

      const List: FunctionComponent<ListProps> = (props) => {
        return (
          <ul>
            {props.items.map(item => props.renderItem(item))}
          </ul>
        );
      };

      const vnode = (
        <List
          items={['a', 'b', 'c']}
          renderItem={(item) => <li key={item}>{item}</li>}
        />
      );

      expect(vnode.type).toBe('ul');
      expect(vnode.children.length).toBe(3);
    });
  });

  describe('Higher-Order Components', () => {
    it('should support basic HOC pattern', () => {
      function withWrapper<P>(Component: FunctionComponent<P>): FunctionComponent<P> {
        return (props: P) => (
          <div className="wrapper">
            <Component {...props} />
          </div>
        );
      }

      const BaseComponent: FunctionComponent = () => <span>Base</span>;
      const WrappedComponent = withWrapper(BaseComponent);

      const vnode = <WrappedComponent />;

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('wrapper');
    });

    it('should support HOC with prop injection', () => {
      interface InjectedProps {
        injected: string;
      }

      function withInjectedProp<P>(
        Component: FunctionComponent<P & InjectedProps>
      ): FunctionComponent<P> {
        return (props: P) => {
          const enhancedProps = { ...props, injected: 'injected-value' } as P & InjectedProps;
          return <Component {...enhancedProps} />;
        };
      }

      const BaseComponent: FunctionComponent<InjectedProps> = (props) => (
        <div>{props.injected}</div>
      );

      const EnhancedComponent = withInjectedProp(BaseComponent);
      const vnode = <EnhancedComponent />;

      expect(vnode.type).toBe('div');
    });
  });

  describe('Component Composition', () => {
    it('should compose multiple components', () => {
      const Title: FunctionComponent<{ text: string }> = (props) => (
        <h1>{props.text}</h1>
      );

      const Subtitle: FunctionComponent<{ text: string }> = (props) => (
        <h2>{props.text}</h2>
      );

      const Content: FunctionComponent<{ text: string }> = (props) => (
        <p>{props.text}</p>
      );

      const Page: FunctionComponent = () => (
        <div>
          <Title text="Page Title" />
          <Subtitle text="Page Subtitle" />
          <Content text="Page content" />
        </div>
      );

      const vnode = <Page />;

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBe(3);
    });

    it('should support children prop composition', () => {
      interface LayoutProps {
        header: any;
        footer: any;
        children?: any;
      }

      const Layout: FunctionComponent<LayoutProps> = (props) => (
        <div className="layout">
          <header>{props.header}</header>
          <main>{props.children}</main>
          <footer>{props.footer}</footer>
        </div>
      );

      const vnode = (
        <Layout
          header={<h1>Header</h1>}
          footer={<p>Footer</p>}
        >
          <p>Main content</p>
        </Layout>
      );

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('layout');
      expect(vnode.children.length).toBe(3);
    });
  });

  describe('Props Validation and Types', () => {
    it('should handle typed props correctly', () => {
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

      const vnode = <UserCard name="John" age={30} email="john@example.com" />;

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('user-card');
    });

    it('should handle optional props', () => {
      interface ButtonProps {
        text: string;
        onClick?: () => void;
        disabled?: boolean;
      }

      const Button: FunctionComponent<ButtonProps> = (props) => (
        <button onClick={props.onClick} disabled={props.disabled}>
          {props.text}
        </button>
      );

      const vnodeWithOptional = <Button text="Click" onClick={() => {}} disabled={true} />;
      const vnodeWithoutOptional = <Button text="Click" />;

      expect(vnodeWithOptional.props.disabled).toBe(true);
      expect(vnodeWithoutOptional.props.disabled).toBeUndefined();
    });

    it('should handle union type props', () => {
      interface AlertProps {
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
      }

      const Alert: FunctionComponent<AlertProps> = (props) => (
        <div className={`alert alert-${props.type}`}>
          {props.message}
        </div>
      );

      const vnode = <Alert type="success" message="Operation successful!" />;

      expect(vnode.props.className).toBe('alert alert-success');
    });
  });

  describe('Conditional Rendering in Components', () => {
    it('should handle conditional rendering', () => {
      interface ConditionalProps {
        show: boolean;
        children?: any;
      }

      const Conditional: FunctionComponent<ConditionalProps> = (props) => {
        return props.show ? <div>{props.children}</div> : null;
      };

      const visibleVnode = <Conditional show={true}><p>Visible</p></Conditional>;
      const hiddenVnode = <Conditional show={false}><p>Hidden</p></Conditional>;

      expect(visibleVnode.type).toBe('div');
      expect(hiddenVnode.type).toBe('');
    });

    it('should handle ternary in component', () => {
      interface StatusProps {
        isOnline: boolean;
      }

      const Status: FunctionComponent<StatusProps> = (props) => (
        <div className={props.isOnline ? 'online' : 'offline'}>
          {props.isOnline ? 'User is online' : 'User is offline'}
        </div>
      );

      const onlineVnode = <Status isOnline={true} />;
      const offlineVnode = <Status isOnline={false} />;

      expect(onlineVnode.props.className).toBe('online');
      expect(offlineVnode.props.className).toBe('offline');
    });
  });

  describe('List Rendering in Components', () => {
    it('should render list with map', () => {
      interface ListProps {
        items: string[];
      }

      const List: FunctionComponent<ListProps> = (props) => (
        <ul>
          {props.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

      const vnode = <List items={['apple', 'banana', 'cherry']} />;

      expect(vnode.type).toBe('ul');
      expect(vnode.children.length).toBe(3);
    });

    it('should render list with keys', () => {
      interface Item {
        id: string;
        name: string;
      }

      interface ItemListProps {
        items: Item[];
      }

      const ItemList: FunctionComponent<ItemListProps> = (props) => (
        <div>
          {props.items.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      );

      const vnode = (
        <ItemList
          items={[
            { id: '1', name: 'First' },
            { id: '2', name: 'Second' }
          ]}
        />
      );

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBe(2);
      expect(vnode.children[0].key).toBe('1');
      expect(vnode.children[1].key).toBe('2');
    });
  });

  describe('Component with Fragments', () => {
    it('should render component returning Fragment', () => {
      const MultipleElements: FunctionComponent = () => (
        <>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </>
      );

      const vnode = <MultipleElements />;

      // Fragment type should be preserved
      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle Fragment with conditional content', () => {
      interface ConditionalFragmentProps {
        showAll: boolean;
      }

      const ConditionalFragment: FunctionComponent<ConditionalFragmentProps> = (props) => (
        <>
          <div>Always shown</div>
          {props.showAll && <div>Conditionally shown</div>}
        </>
      );

      const allVnode = <ConditionalFragment showAll={true} />;
      const partialVnode = <ConditionalFragment showAll={false} />;

      expect(allVnode.children.length).toBeGreaterThan(partialVnode.children.length);
    });
  });

  describe('Component Default Props Pattern', () => {
    it('should handle default props with destructuring', () => {
      interface ButtonProps {
        text: string;
        variant?: 'primary' | 'secondary';
        size?: 'small' | 'medium' | 'large';
      }

      const Button: FunctionComponent<ButtonProps> = ({
        text,
        variant = 'primary',
        size = 'medium'
      }) => (
        <button className={`btn btn-${variant} btn-${size}`}>
          {text}
        </button>
      );

      const vnodeWithDefaults = <Button text="Click" />;
      const vnodeCustom = <Button text="Click" variant="secondary" size="large" />;

      expect(vnodeWithDefaults.props.className).toBe('btn btn-primary btn-medium');
      expect(vnodeCustom.props.className).toBe('btn btn-secondary btn-large');
    });
  });

  describe('Component Event Handlers', () => {
    it('should handle event handlers in components', () => {
      interface ClickableProps {
        onClick: () => void;
        children?: any;
      }

      const Clickable: FunctionComponent<ClickableProps> = (props) => (
        <div onClick={props.onClick}>
          {props.children}
        </div>
      );

      const handler = () => console.log('clicked');
      const vnode = <Clickable onClick={handler}>Click me</Clickable>;

      expect(vnode.props.onClick).toBe(handler);
    });

    it('should handle multiple event handlers', () => {
      interface InteractiveProps {
        onClick: () => void;
        onMouseEnter: () => void;
        onMouseLeave: () => void;
      }

      const Interactive: FunctionComponent<InteractiveProps> = (props) => (
        <div
          onClick={props.onClick}
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
        >
          Interactive
        </div>
      );

      const handlers = {
        onClick: () => {},
        onMouseEnter: () => {},
        onMouseLeave: () => {}
      };

      const vnode = <Interactive {...handlers} />;

      expect(vnode.props.onClick).toBe(handlers.onClick);
      expect(vnode.props.onMouseEnter).toBe(handlers.onMouseEnter);
      expect(vnode.props.onMouseLeave).toBe(handlers.onMouseLeave);
    });
  });

  describe('Complex Component Patterns', () => {
    it('should handle compound component pattern', () => {
      interface TabsProps {
        children?: any;
      }

      interface TabProps {
        label: string;
        children?: any;
      }

      const Tabs: FunctionComponent<TabsProps> = (props) => (
        <div className="tabs">
          {props.children}
        </div>
      );

      const Tab: FunctionComponent<TabProps> = (props) => (
        <div className="tab" data-label={props.label}>
          {props.children}
        </div>
      );

      const vnode = (
        <Tabs>
          <Tab label="Tab 1"><p>Content 1</p></Tab>
          <Tab label="Tab 2"><p>Content 2</p></Tab>
        </Tabs>
      );

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('tabs');
      expect(vnode.children.length).toBe(2);
    });

    it('should handle provider-consumer pattern', () => {
      interface ProviderProps {
        value: any;
        children?: any;
      }

      const Provider: FunctionComponent<ProviderProps> = (props) => (
        <div data-context={JSON.stringify(props.value)}>
          {props.children}
        </div>
      );

      const Consumer: FunctionComponent = () => (
        <span>Consumer content</span>
      );

      const vnode = (
        <Provider value={{ user: 'John', role: 'admin' }}>
          <Consumer />
        </Provider>
      );

      expect(vnode.type).toBe('div');
      expect(vnode.props['data-context']).toBeTruthy();
    });
  });
});

