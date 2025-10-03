/**
 * JSX TypeScript Type Safety Tests
 * 测试 TypeScript 类型系统的正确性
 */

import { describe, it, expect } from 'vitest';
import type { FunctionComponent, ComponentType } from './jsx.d';
import type { VNode } from './vdom/types';
import { Fragment } from './jsx-runtime';

describe('JSX TypeScript Types', () => {
  describe('FunctionComponent Type', () => {
    it('should accept FunctionComponent without props', () => {
      const Component: FunctionComponent = () => {
        return <div>No props</div>;
      };

      const vnode = <Component />;
      expect(vnode.type).toBe('div');
    });

    it('should accept FunctionComponent with typed props', () => {
      interface Props {
        title: string;
        count: number;
      }

      const Component: FunctionComponent<Props> = (props) => {
        return (
          <div>
            <h1>{props.title}</h1>
            <p>{props.count}</p>
          </div>
        );
      };

      const vnode = <Component title="Test" count={42} />;
      expect(vnode.type).toBe('div');
    });

    it('should accept FunctionComponent with optional props', () => {
      interface Props {
        required: string;
        optional?: number;
      }

      const Component: FunctionComponent<Props> = (props) => {
        return <div>{props.required}</div>;
      };

      const vnode1 = <Component required="test" />;
      const vnode2 = <Component required="test" optional={10} />;

      expect(vnode1.type).toBe('div');
      expect(vnode2.type).toBe('div');
    });

    it('should accept FunctionComponent with children', () => {
      interface Props {
        title: string;
        children?: any;
      }

      const Component: FunctionComponent<Props> = (props) => {
        return (
          <div>
            <h1>{props.title}</h1>
            {props.children}
          </div>
        );
      };

      const vnode = (
        <Component title="Title">
          <p>Child content</p>
        </Component>
      );

      expect(vnode.type).toBe('div');
    });

    it('should return VNode or null', () => {
      const ValidComponent: FunctionComponent = () => <div>Valid</div>;
      const NullComponent: FunctionComponent = () => null;

      const vnode1 = <ValidComponent />;
      const vnode2 = <NullComponent />;

      expect(vnode1.type).toBe('div');
      expect(vnode2.type).toBe('');
    });
  });

  describe('ComponentType', () => {
    it('should accept ComponentType', () => {
      const Component: ComponentType = () => <div>Component</div>;

      const vnode = <Component />;
      expect(vnode.type).toBe('div');
    });

    it('should accept ComponentType with props', () => {
      interface Props {
        value: string;
      }

      const Component: ComponentType<Props> = (props) => (
        <div>{props.value}</div>
      );

      const vnode = <Component value="test" />;
      expect(vnode.type).toBe('div');
    });
  });

  describe('JSX.Element Type', () => {
    it('should treat VNode as JSX.Element', () => {
      const element: JSX.Element = <div>Element</div>;

      expect(element.type).toBe('div');
    });

    it('should accept JSX.Element from component', () => {
      const Component = (): JSX.Element => {
        return <span>Component</span>;
      };

      const vnode = <Component />;
      expect(vnode.type).toBe('span');
    });
  });

  describe('Generic Props', () => {
    it('should support generic component props', () => {
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

      const numberList = (
        <List
          items={[1, 2, 3]}
          renderItem={(item) => <span>{item}</span>}
        />
      );

      expect(stringList.type).toBe('ul');
      expect(numberList.type).toBe('ul');
    });

    it('should support generic object props', () => {
      interface ItemProps<T> {
        data: T;
        onSelect: (data: T) => void;
      }

      function Item<T>(props: ItemProps<T>): VNode {
        return (
          <div onClick={() => props.onSelect(props.data)}>
            {JSON.stringify(props.data)}
          </div>
        );
      }

      interface User {
        id: number;
        name: string;
      }

      const user: User = { id: 1, name: 'John' };
      const vnode = (
        <Item
          data={user}
          onSelect={(u) => console.log(u.name)}
        />
      );

      expect(vnode.type).toBe('div');
    });
  });

  describe('Union Type Props', () => {
    it('should support union types in props', () => {
      interface Props {
        variant: 'primary' | 'secondary' | 'tertiary';
        size: 'small' | 'medium' | 'large';
      }

      const Button: FunctionComponent<Props> = (props) => (
        <button className={`btn-${props.variant} btn-${props.size}`}>
          Button
        </button>
      );

      const vnode = <Button variant="primary" size="medium" />;
      expect(vnode.props.className).toBe('btn-primary btn-medium');
    });

    it('should support string literal unions', () => {
      type Alignment = 'left' | 'center' | 'right';

      interface TextProps {
        align: Alignment;
      }

      const Text: FunctionComponent<TextProps> = (props) => (
        <div style={{ textAlign: props.align }}>Text</div>
      );

      const vnode = <Text align="center" />;
      expect(vnode.props.style.textAlign).toBe('center');
    });

    it('should support numeric literal unions', () => {
      type Level = 1 | 2 | 3 | 4 | 5;

      interface HeadingProps {
        level: Level;
        children?: any;
      }

      const Heading: FunctionComponent<HeadingProps> = (props) => {
        const Tag = `h${props.level}` as any;
        return <Tag>{props.children}</Tag>;
      };

      const vnode = <Heading level={2}>Title</Heading>;
      expect(vnode.type).toBe('h2');
    });
  });

  describe('Intersection Types', () => {
    it('should support intersection types', () => {
      interface BaseProps {
        className?: string;
      }

      interface ClickableProps {
        onClick: () => void;
      }

      type ButtonProps = BaseProps & ClickableProps & {
        label: string;
      };

      const Button: FunctionComponent<ButtonProps> = (props) => (
        <button className={props.className} onClick={props.onClick}>
          {props.label}
        </button>
      );

      const handler = () => {};
      const vnode = (
        <Button
          className="btn"
          onClick={handler}
          label="Click me"
        />
      );

      expect(vnode.props.className).toBe('btn');
      expect(vnode.props.onClick).toBe(handler);
    });
  });

  describe('Conditional Types', () => {
    it('should work with conditional prop types', () => {
      interface WithLink {
        href: string;
        target?: string;
      }

      interface WithoutLink {
        onClick: () => void;
      }

      type CardProps = {
        title: string;
      } & (WithLink | WithoutLink);

      const Card: FunctionComponent<CardProps> = (props) => {
        if ('href' in props) {
          return (
            <a href={props.href} target={props.target}>
              {props.title}
            </a>
          );
        } else {
          return (
            <div onClick={props.onClick}>
              {props.title}
            </div>
          );
        }
      };

      const linkCard = <Card title="Link" href="/page" />;
      const clickCard = <Card title="Click" onClick={() => {}} />;

      expect(linkCard.type).toBe('a');
      expect(clickCard.type).toBe('div');
    });
  });

  describe('Readonly Props', () => {
    it('should support readonly props', () => {
      interface Props {
        readonly id: string;
        readonly items: readonly string[];
      }

      const List: FunctionComponent<Props> = (props) => (
        <ul id={props.id}>
          {props.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

      const vnode = <List id="my-list" items={['a', 'b', 'c']} />;
      expect(vnode.props.id).toBe('my-list');
    });
  });

  describe('Partial and Required Types', () => {
    it('should support Partial props', () => {
      interface FullProps {
        name: string;
        age: number;
        email: string;
      }

      type PartialProps = Partial<FullProps>;

      const Profile: FunctionComponent<PartialProps> = (props) => (
        <div>
          {props.name && <p>Name: {props.name}</p>}
          {props.age && <p>Age: {props.age}</p>}
          {props.email && <p>Email: {props.email}</p>}
        </div>
      );

      const vnode1 = <Profile name="John" />;
      const vnode2 = <Profile name="John" age={30} />;
      const vnode3 = <Profile name="John" age={30} email="john@example.com" />;

      expect(vnode1.type).toBe('div');
      expect(vnode2.type).toBe('div');
      expect(vnode3.type).toBe('div');
    });

    it('should support Required props', () => {
      interface OptionalProps {
        name?: string;
        age?: number;
      }

      type RequiredProps = Required<OptionalProps>;

      const User: FunctionComponent<RequiredProps> = (props) => (
        <div>
          <p>{props.name}</p>
          <p>{props.age}</p>
        </div>
      );

      const vnode = <User name="John" age={30} />;
      expect(vnode.type).toBe('div');
    });
  });

  describe('Mapped Types', () => {
    it('should support Record type', () => {
      interface Props {
        data: Record<string, string>;
      }

      const DataDisplay: FunctionComponent<Props> = (props) => (
        <div>
          {Object.entries(props.data).map(([key, value]) => (
            <div key={key}>
              {key}: {value}
            </div>
          ))}
        </div>
      );

      const vnode = (
        <DataDisplay
          data={{ name: 'John', role: 'Developer' }}
        />
      );

      expect(vnode.type).toBe('div');
    });

    it('should support Pick type', () => {
      interface FullUser {
        id: number;
        name: string;
        email: string;
        age: number;
      }

      type UserPreview = Pick<FullUser, 'name' | 'email'>;

      const Preview: FunctionComponent<UserPreview> = (props) => (
        <div>
          <p>{props.name}</p>
          <p>{props.email}</p>
        </div>
      );

      const vnode = <Preview name="John" email="john@example.com" />;
      expect(vnode.type).toBe('div');
    });

    it('should support Omit type', () => {
      interface FullUser {
        id: number;
        name: string;
        password: string;
        email: string;
      }

      type SafeUser = Omit<FullUser, 'password'>;

      const UserCard: FunctionComponent<SafeUser> = (props) => (
        <div>
          <p>ID: {props.id}</p>
          <p>Name: {props.name}</p>
          <p>Email: {props.email}</p>
        </div>
      );

      const vnode = <UserCard id={1} name="John" email="john@example.com" />;
      expect(vnode.type).toBe('div');
    });
  });

  describe('Intrinsic Elements', () => {
    it('should have correct types for intrinsic elements', () => {
      // These should all compile without type errors
      const div: JSX.Element = <div className="test">Content</div>;
      const span: JSX.Element = <span>Text</span>;
      const button: JSX.Element = <button onClick={() => {}}>Click</button>;
      const input: JSX.Element = <input type="text" value="test" />;

      expect(div.type).toBe('div');
      expect(span.type).toBe('span');
      expect(button.type).toBe('button');
      expect(input.type).toBe('input');
    });

    it('should infer correct attribute types', () => {
      const inputText: JSX.Element = <input type="text" placeholder="Enter" />;
      const inputNumber: JSX.Element = <input type="number" min={0} max={100} />;
      const inputCheckbox: JSX.Element = <input type="checkbox" checked={true} />;

      expect(inputText.props.type).toBe('text');
      expect(inputNumber.props.min).toBe(0);
      expect(inputCheckbox.props.checked).toBe(true);
    });
  });

  describe('Children Types', () => {
    it('should accept ReactNode as children', () => {
      interface Props {
        children?: JSX.ReactNode;
      }

      const Container: FunctionComponent<Props> = (props) => (
        <div className="container">{props.children}</div>
      );

      const vnodeWithString = <Container>String child</Container>;
      const vnodeWithNumber = <Container>{42}</Container>;
      const vnodeWithElement = <Container><span>Element</span></Container>;
      const vnodeWithArray = <Container>{[<div key="1">1</div>, <div key="2">2</div>]}</Container>;

      expect(vnodeWithString.type).toBe('div');
      expect(vnodeWithNumber.type).toBe('div');
      expect(vnodeWithElement.type).toBe('div');
      expect(vnodeWithArray.type).toBe('div');
    });
  });

  describe('Fragment Types', () => {
    it('should handle Fragment type', () => {
      const fragment: JSX.Element = (
        <Fragment>
          <div>First</div>
          <div>Second</div>
        </Fragment>
      );

      expect(fragment.type).toBe(Fragment);
    });

    it('should handle short syntax Fragment', () => {
      const fragment: JSX.Element = (
        <>
          <div>First</div>
          <div>Second</div>
        </>
      );

      // Short syntax should also resolve to Fragment
      expect(fragment.children.length).toBeGreaterThan(0);
    });
  });

  describe('Event Handler Types', () => {
    it('should have correct types for event handlers', () => {
      const handleClick = (event: MouseEvent) => {
        console.log(event.clientX);
      };

      const handleInput = (event: InputEvent) => {
        console.log((event.target as HTMLInputElement).value);
      };

      const handleChange = (event: Event) => {
        console.log(event);
      };

      const vnode = (
        <div>
          <button onClick={handleClick}>Click</button>
          <input onInput={handleInput} onChange={handleChange} />
        </div>
      );

      expect(vnode.type).toBe('div');
    });

    it('should accept inline arrow functions', () => {
      const vnode = (
        <button onClick={(e) => console.log(e)}>
          Click
        </button>
      );

      expect(typeof vnode.props.onClick).toBe('function');
    });
  });

  describe('Style Type Safety', () => {
    it('should accept CSSStyleDeclaration', () => {
      const styles: Partial<CSSStyleDeclaration> = {
        color: 'red',
        fontSize: '16px',
        backgroundColor: 'blue'
      };

      const vnode = <div style={styles}>Styled</div>;

      expect(vnode.props.style).toBeDefined();
    });

    it('should accept string style', () => {
      const vnode = <div style="color: red; font-size: 16px;">Styled</div>;

      expect(vnode.props.style).toBe('color: red; font-size: 16px;');
    });
  });

  describe('Type Inference', () => {
    it('should infer prop types from usage', () => {
      const Button = (props: { label: string }) => (
        <button>{props.label}</button>
      );

      // TypeScript should infer that label is required
      const vnode = <Button label="Click" />;

      expect(vnode.type).toBe('button');
    });

    it('should infer return type as VNode', () => {
      const component = () => <div>Content</div>;
      const result = component();

      // result should be inferred as VNode
      expect(result.type).toBe('div');
    });
  });
});

