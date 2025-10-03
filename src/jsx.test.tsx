/**
 * Comprehensive JSX/TSX Engine Tests
 * Tests the accuracy and completeness of JSX transformation and rendering
 */

import { describe, it, expect } from 'vitest';
import { jsx, jsxs, Fragment } from './jsx-runtime';
import { jsxDEV } from './jsx-dev-runtime';
import { createElement } from './vdom/createElement';
import type { VNode } from './vdom/types';

// JSX is automatically transformed by Vite using our jsx-runtime

describe('JSX/TSX Engine', () => {
  describe('Basic JSX transformation', () => {
    it('should transform simple JSX elements', () => {
      const vnode = <div>Hello</div>;
      
      expect(vnode.type).toBe('div');
      expect(vnode.children).toHaveLength(1);
      expect(vnode.children[0].type).toBe('');
      expect((vnode.children[0] as VNode).children[0]).toBe('Hello');
    });

    it('should handle JSX with props', () => {
      const vnode = <div className="test" id="myDiv">Content</div>;
      
      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('test');
      expect(vnode.props.id).toBe('myDiv');
    });

    it('should handle nested JSX elements', () => {
      const vnode = (
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
        </div>
      );
      
      expect(vnode.children).toHaveLength(2);
      expect(vnode.children[0].type).toBe('h1');
      expect(vnode.children[1].type).toBe('p');
    });

    it('should handle self-closing JSX elements', () => {
      const vnode = <input type="text" />;
      
      expect(vnode.type).toBe('input');
      expect(vnode.props.type).toBe('text');
      expect(vnode.children).toHaveLength(0);
    });
  });

  describe('JSX with expressions', () => {
    it('should handle JavaScript expressions in JSX', () => {
      const name = 'World';
      const vnode = <div>Hello {name}!</div>;
      
      expect(vnode.children).toHaveLength(3);
      expect((vnode.children[0] as VNode).children[0]).toBe('Hello ');
      expect((vnode.children[1] as VNode).children[0]).toBe('World');
      expect((vnode.children[2] as VNode).children[0]).toBe('!');
    });

    it('should handle conditional rendering', () => {
      const showTitle = true;
      const vnode = (
        <div>
          {showTitle && <h1>Title</h1>}
          <p>Content</p>
        </div>
      );
      
      expect(vnode.children).toHaveLength(2);
      expect(vnode.children[0].type).toBe('h1');
      expect(vnode.children[1].type).toBe('p');
    });

    it('should filter out false, null, and undefined', () => {
      const vnode = (
        <div>
          {false}
          {null}
          {undefined}
          <span>Visible</span>
        </div>
      );
      
      expect(vnode.children).toHaveLength(1);
      expect(vnode.children[0].type).toBe('span');
    });

    it('should handle ternary operators', () => {
      const isLoggedIn = false;
      const vnode = (
        <div>
          {isLoggedIn ? <span>Welcome</span> : <span>Please login</span>}
        </div>
      );
      
      expect(vnode.children).toHaveLength(1);
      expect(vnode.children[0].type).toBe('span');
      expect(((vnode.children[0] as VNode).children[0] as VNode).children[0]).toBe('Please login');
    });
  });

  describe('JSX arrays and lists', () => {
    it('should handle arrays of elements', () => {
      const items = ['Apple', 'Banana', 'Cherry'];
      const vnode = (
        <ul>
          {items.map(item => <li key={item}>{item}</li>)}
        </ul>
      );
      
      expect(vnode.type).toBe('ul');
      expect(vnode.children).toHaveLength(3);
      expect(vnode.children[0].key).toBe('Apple');
      expect(vnode.children[1].key).toBe('Banana');
      expect(vnode.children[2].key).toBe('Cherry');
    });

    it('should handle arrays with mixed content', () => {
      const vnode = (
        <div>
          Text before
          {['a', 'b', 'c'].map(letter => <span key={letter}>{letter}</span>)}
          Text after
        </div>
      );
      
      expect(vnode.children).toHaveLength(5);
      expect((vnode.children[0] as VNode).children[0]).toBe('Text before');
      expect(vnode.children[1].type).toBe('span');
      expect(vnode.children[2].type).toBe('span');
      expect(vnode.children[3].type).toBe('span');
      expect((vnode.children[4] as VNode).children[0]).toBe('Text after');
    });
  });

  describe('JSX Fragments', () => {
    it('should handle Fragment with multiple children', () => {
      const vnode = (
        <Fragment>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </Fragment>
      );
      
      expect(vnode.type).toBe(Fragment);
      expect(vnode.children).toHaveLength(3);
      expect(vnode.children[0].type).toBe('div');
      expect(vnode.children[1].type).toBe('div');
      expect(vnode.children[2].type).toBe('div');
    });

    it('should handle Fragment with mixed content', () => {
      const vnode = (
        <Fragment>
          Text node
          <span>Element</span>
          {42}
        </Fragment>
      );
      
      expect(vnode.children).toHaveLength(3);
      expect((vnode.children[0] as VNode).children[0]).toBe('Text node');
      expect(vnode.children[1].type).toBe('span');
      expect((vnode.children[2] as VNode).children[0]).toBe('42');
    });

    it('should handle nested Fragments', () => {
      const vnode = (
        <div>
          <Fragment>
            <span>Inner 1</span>
            <span>Inner 2</span>
          </Fragment>
          <p>Outer</p>
        </div>
      );
      
      expect(vnode.children).toHaveLength(2);
      expect(vnode.children[0].type).toBe(Fragment);
      expect((vnode.children[0] as VNode).children).toHaveLength(2);
    });
  });

  describe('JSX with event handlers', () => {
    it('should handle onClick event handler', () => {
      const handleClick = () => console.log('clicked');
      const vnode = <button onClick={handleClick}>Click me</button>;
      
      expect(vnode.props.onClick).toBe(handleClick);
    });

    it('should handle multiple event handlers', () => {
      const handleClick = () => {};
      const handleMouseEnter = () => {};
      const vnode = (
        <div onClick={handleClick} onMouseEnter={handleMouseEnter}>
          Hover me
        </div>
      );
      
      expect(vnode.props.onClick).toBe(handleClick);
      expect(vnode.props.onMouseEnter).toBe(handleMouseEnter);
    });

    it('should handle inline arrow function event handlers', () => {
      const vnode = <button onClick={() => console.log('inline')}>Click</button>;
      
      expect(typeof vnode.props.onClick).toBe('function');
    });
  });

  describe('JSX with special attributes', () => {
    it('should handle className attribute', () => {
      const vnode = <div className="my-class">Content</div>;
      
      expect(vnode.props.className).toBe('my-class');
    });

    it('should handle style attribute as object', () => {
      const vnode = <div style={{ color: 'red', fontSize: '16px' }}>Styled</div>;
      
      expect(vnode.props.style).toEqual({ color: 'red', fontSize: '16px' });
    });

    it('should handle data attributes', () => {
      const vnode = <div data-testid="my-test" data-value="123">Data</div>;
      
      expect(vnode.props['data-testid']).toBe('my-test');
      expect(vnode.props['data-value']).toBe('123');
    });

    it('should handle aria attributes', () => {
      const vnode = <button aria-label="Close" aria-pressed="true">X</button>;
      
      expect(vnode.props['aria-label']).toBe('Close');
      expect(vnode.props['aria-pressed']).toBe('true');
    });
  });

  describe('JSX with form elements', () => {
    it('should handle input with value and onChange', () => {
      const handleChange = () => {};
      const vnode = <input type="text" value="test" onChange={handleChange} />;
      
      expect(vnode.props.type).toBe('text');
      expect(vnode.props.value).toBe('test');
      expect(vnode.props.onChange).toBe(handleChange);
    });

    it('should handle checkbox input', () => {
      const vnode = <input type="checkbox" checked={true} />;
      
      expect(vnode.props.type).toBe('checkbox');
      expect(vnode.props.checked).toBe(true);
    });

    it('should handle textarea', () => {
      const vnode = <textarea value="Initial text" rows={5} />;
      
      expect(vnode.props.value).toBe('Initial text');
      expect(vnode.props.rows).toBe(5);
    });

    it('should handle select and option', () => {
      const vnode = (
        <select value="option2">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
      );
      
      expect(vnode.props.value).toBe('option2');
      expect(vnode.children).toHaveLength(3);
      expect(vnode.children[0].type).toBe('option');
    });
  });

  describe('JSX type safety', () => {
    it('should preserve VNode structure', () => {
      const vnode = <div>Test</div>;
      
      expect(vnode).toHaveProperty('type');
      expect(vnode).toHaveProperty('props');
      expect(vnode).toHaveProperty('children');
    });

    it('should handle number children', () => {
      const count = 42;
      const vnode = <div>Count: {count}</div>;
      
      expect(vnode.children).toHaveLength(2);
      expect((vnode.children[1] as VNode).children[0]).toBe('42');
    });

    it('should handle boolean props', () => {
      const vnode = <input disabled={true} required={false} />;
      
      expect(vnode.props.disabled).toBe(true);
      expect(vnode.props.required).toBe(false);
    });
  });

  describe('JSX keys', () => {
    it('should handle key prop on elements', () => {
      const vnode = <div key="unique-key">Content</div>;
      
      expect(vnode.key).toBe('unique-key');
    });

    it('should handle keys in mapped lists', () => {
      const items = [1, 2, 3];
      const vnodes = items.map(item => <div key={item}>Item {item}</div>);
      
      expect(vnodes[0].key).toBe(1);
      expect(vnodes[1].key).toBe(2);
      expect(vnodes[2].key).toBe(3);
    });

    it('should handle string and number keys', () => {
      const stringKey = <div key="string-key">String</div>;
      const numberKey = <div key={123}>Number</div>;
      
      expect(stringKey.key).toBe('string-key');
      expect(numberKey.key).toBe(123);
    });
  });

  describe('JSX edge cases', () => {
    it('should handle empty elements', () => {
      const vnode = <div></div>;
      
      expect(vnode.children).toHaveLength(0);
    });

    it('should handle elements with only whitespace', () => {
      const vnode = <div>   </div>;
      
      expect(vnode.children).toHaveLength(1);
    });

    it('should handle deeply nested structures', () => {
      const vnode = (
        <div>
          <div>
            <div>
              <div>
                <span>Deep</span>
              </div>
            </div>
          </div>
        </div>
      );
      
      expect(vnode.type).toBe('div');
      expect(vnode.children[0].type).toBe('div');
      expect((vnode.children[0] as VNode).children[0].type).toBe('div');
    });

    it('should handle elements with many children', () => {
      const vnode = (
        <div>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
          <span>10</span>
        </div>
      );
      
      expect(vnode.children).toHaveLength(10);
    });
  });

  describe('JSX runtime functions', () => {
    it('should expose jsx function', () => {
      const vnode = jsx('div', { className: 'test' });
      
      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('test');
    });

    it('should expose jsxs function for static children', () => {
      const vnode = jsxs('div', { children: [jsx('span', {}), jsx('span', {})] });
      
      expect(vnode.children).toHaveLength(2);
    });

    it('should handle children prop correctly', () => {
      const children = [
        jsx('span', {}, 'child1'),
        jsx('span', {}, 'child2')
      ];
      const vnode = jsx('div', { children });
      
      expect(vnode.children).toHaveLength(2);
    });

    it('should handle key parameter', () => {
      const vnode = jsx('div', {}, 'my-key');
      
      expect(vnode.key).toBe('my-key');
    });
  });

  describe('SVG Elements and Attributes', () => {
    it('should handle basic SVG elements', () => {
      const vnode = (
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );

      expect(vnode.type).toBe('svg');
      expect(vnode.props.width).toBe('24');
      expect(vnode.props.height).toBe('24');
      expect(vnode.props.viewBox).toBe('0 0 24 24');
      expect(vnode.children).toHaveLength(1);
      expect(vnode.children[0].type).toBe('circle');
    });

    it('should handle SVG path element', () => {
      const vnode = <path d="M10 10 L20 20" stroke="black" strokeWidth="2" />;

      expect(vnode.type).toBe('path');
      expect(vnode.props.d).toBe('M10 10 L20 20');
      expect(vnode.props.stroke).toBe('black');
      expect(vnode.props.strokeWidth).toBe('2');
    });

    it('should handle SVG circle with attributes', () => {
      const vnode = <circle cx="50" cy="50" r="40" fill="red" />;

      expect(vnode.type).toBe('circle');
      expect(vnode.props.cx).toBe('50');
      expect(vnode.props.cy).toBe('50');
      expect(vnode.props.r).toBe('40');
      expect(vnode.props.fill).toBe('red');
    });

    it('should handle SVG rect element', () => {
      const vnode = <rect x="10" y="10" width="100" height="50" fill="blue" />;

      expect(vnode.type).toBe('rect');
      expect(vnode.props.x).toBe('10');
      expect(vnode.props.y).toBe('10');
      expect(vnode.props.width).toBe('100');
      expect(vnode.props.height).toBe('50');
    });

    it('should handle SVG line element', () => {
      const vnode = <line x1="0" y1="0" x2="100" y2="100" stroke="green" />;

      expect(vnode.type).toBe('line');
      expect(vnode.props.stroke).toBe('green');
    });

    it('should handle SVG polygon and polyline', () => {
      const polygon = <polygon points="0,0 100,0 50,100" fill="yellow" />;
      const polyline = <polyline points="0,0 50,50 100,0" stroke="purple" />;

      expect(polygon.type).toBe('polygon');
      expect(polyline.type).toBe('polyline');
    });

    it('should handle SVG group (g) element', () => {
      const vnode = (
        <g transform="translate(10, 20)">
          <circle cx="0" cy="0" r="5" />
          <circle cx="10" cy="0" r="5" />
        </g>
      );

      expect(vnode.type).toBe('g');
      expect(vnode.props.transform).toBe('translate(10, 20)');
      expect(vnode.children).toHaveLength(2);
    });

    it('should handle SVG text elements', () => {
      const vnode = (
        <text x="10" y="20" fill="black">
          Hello SVG
        </text>
      );

      expect(vnode.type).toBe('text');
      expect(vnode.props.x).toBe('10');
      expect(vnode.props.y).toBe('20');
    });

    it('should handle SVG defs and nested structure', () => {
      const vnode = (
        <svg>
          <defs>
            <circle id="myCircle" r="10" />
          </defs>
          <g>
            <circle cx="20" cy="20" r="15" />
          </g>
        </svg>
      );

      expect(vnode.type).toBe('svg');
      expect(vnode.children).toHaveLength(2);
      expect(vnode.children[0].type).toBe('defs');
      expect(vnode.children[1].type).toBe('g');
    });

    it('should handle SVG mixed with HTML', () => {
      const vnode = (
        <div className="container">
          <h1>Icon</h1>
          <svg width="50" height="50">
            <circle cx="25" cy="25" r="20" fill="blue" />
          </svg>
          <p>Description</p>
        </div>
      );

      expect(vnode.type).toBe('div');
      expect(vnode.children).toHaveLength(3);
      expect(vnode.children[1].type).toBe('svg');
    });

    it('should handle SVG event handlers', () => {
      const handleClick = () => console.log('clicked');
      const vnode = <circle cx="50" cy="50" r="20" onClick={handleClick} />;

      expect(vnode.props.onClick).toBe(handleClick);
    });
  });

  describe('jsxDEV Development Mode', () => {
    it('should handle jsxDEV function with basic props', () => {
      const vnode = jsxDEV('div', { className: 'test' });

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('test');
    });

    it('should handle jsxDEV with key parameter', () => {
      const vnode = jsxDEV('div', {}, 'test-key');

      expect(vnode.key).toBe('test-key');
    });

    it('should handle jsxDEV with __source and __self parameters', () => {
      const vnode = jsxDEV(
        'div',
        { className: 'test' },
        'key',
        false,
        { fileName: 'test.tsx', lineNumber: 10 },
        this
      );

      expect(vnode.type).toBe('div');
      expect(vnode.props.className).toBe('test');
      expect(vnode.key).toBe('key');
    });

    it('should have same behavior as jsx function', () => {
      const jsxVnode = jsx('div', { id: 'test' });
      const jsxDEVVnode = jsxDEV('div', { id: 'test' });

      expect(jsxVnode.type).toBe(jsxDEVVnode.type);
      expect(jsxVnode.props).toEqual(jsxDEVVnode.props);
    });
  });

  describe('Advanced Children Handling', () => {
    it('should flatten deeply nested arrays', () => {
      const vnode = (
        <div>
          {[[['nested']], [['array']]]}
        </div>
      );

      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle empty arrays', () => {
      const vnode = <div>{[]}</div>;

      expect(vnode.children).toHaveLength(0);
    });

    it('should handle mixed type children correctly', () => {
      const vnode = (
        <div>
          {'string'}
          {42}
          {null}
          {undefined}
          {false}
          {true}
          <span>element</span>
        </div>
      );

      // null, undefined, false, true should be filtered out
      expect(vnode.children.length).toBeLessThanOrEqual(3);
    });

    it('should handle children as props vs arguments', () => {
      const childrenAsProp = jsx('div', { children: 'child content' });
      const childrenAsArg = createElement('div', {}, 'child content');

      expect(childrenAsProp.children.length).toBeGreaterThan(0);
      expect(childrenAsArg.children.length).toBeGreaterThan(0);
    });

    it('should handle single child vs array children', () => {
      const singleChild = <div>{'single'}</div>;
      const arrayChildren = <div>{['one', 'two', 'three']}</div>;

      expect(singleChild.children).toHaveLength(1);
      expect(arrayChildren.children.length).toBeGreaterThan(0);
    });

    it('should handle empty string children', () => {
      const vnode = <div>{''}</div>;

      // Empty strings might be filtered out
      expect(vnode.children.length).toBe(0);
    });

    it('should handle whitespace-only text nodes', () => {
      const vnode = <div>   </div>;

      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle complex nested children flattening', () => {
      const items = ['a', 'b', 'c'];
      const vnode = (
        <ul>
          {items.map(item => [
            <li key={item}>{item}</li>,
            item !== 'c' ? <li key={`${item}-sep`}>-</li> : null
          ])}
        </ul>
      );

      expect(vnode.type).toBe('ul');
      expect(vnode.children.length).toBeGreaterThan(0);
    });
  });

  describe('Props Spreading and Special Props', () => {
    it('should handle props spreading', () => {
      const baseProps = { className: 'base', id: 'test' };
      const vnode = <div {...baseProps}>Content</div>;

      expect(vnode.props.className).toBe('base');
      expect(vnode.props.id).toBe('test');
    });

    it('should handle key in props spreading', () => {
      const props = { key: 'item-1', className: 'item' };
      const vnode = <div {...props}>Item</div>;

      expect(vnode.key).toBe('item-1');
      expect(vnode.props.className).toBe('item');
    });

    it('should handle children as prop', () => {
      const children = <span>Child</span>;
      const vnode = <div children={children} />;

      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle boolean attributes', () => {
      const vnode = (
        <input
          disabled={true}
          checked={true}
          readonly={false}
          required={true}
        />
      );

      expect(vnode.props.disabled).toBe(true);
      expect(vnode.props.checked).toBe(true);
      expect(vnode.props.readonly).toBe(false);
      expect(vnode.props.required).toBe(true);
    });

    it('should handle selected attribute', () => {
      const vnode = <option value="test" selected={true}>Test</option>;

      expect(vnode.props.selected).toBe(true);
    });

    it('should handle className (not class)', () => {
      const vnode = <div className="my-class">Content</div>;

      expect(vnode.props.className).toBe('my-class');
      expect(vnode.props.class).toBeUndefined();
    });

    it('should handle htmlFor on label', () => {
      const vnode = <label htmlFor="input-id">Label</label>;

      expect(vnode.props.htmlFor).toBe('input-id');
    });

    it('should handle style as object', () => {
      const vnode = <div style={{ color: 'red', fontSize: '16px' }}>Styled</div>;

      expect(vnode.props.style).toEqual({ color: 'red', fontSize: '16px' });
    });

    it('should handle style as string', () => {
      const vnode = <div style="color: blue; font-size: 14px;">Styled</div>;

      expect(vnode.props.style).toBe('color: blue; font-size: 14px;');
    });

    it('should override props with spread order', () => {
      const baseProps = { className: 'base' };
      const vnode = <div {...baseProps} className="override">Content</div>;

      expect(vnode.props.className).toBe('override');
    });
  });

  describe('Advanced Fragment Scenarios', () => {
    it('should handle empty Fragment', () => {
      const vnode = <Fragment />;

      expect(vnode.type).toBe(Fragment);
      expect(vnode.children).toHaveLength(0);
    });

    it('should handle Fragment as root element', () => {
      const vnode = (
        <Fragment>
          <div>First</div>
          <div>Second</div>
        </Fragment>
      );

      expect(vnode.type).toBe(Fragment);
      expect(vnode.children).toHaveLength(2);
    });

    it('should handle deeply nested Fragments', () => {
      const vnode = (
        <Fragment>
          <Fragment>
            <Fragment>
              <span>Deep</span>
            </Fragment>
          </Fragment>
        </Fragment>
      );

      expect(vnode.type).toBe(Fragment);
      expect(vnode.children).toHaveLength(1);
    });

    it('should handle Fragment with conditional rendering', () => {
      const showFirst = true;
      const showSecond = false;

      const vnode = (
        <Fragment>
          {showFirst && <div>First</div>}
          {showSecond && <div>Second</div>}
          <div>Always</div>
        </Fragment>
      );

      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle Fragment with map operation', () => {
      const items = ['a', 'b', 'c'];
      const vnode = (
        <Fragment>
          {items.map(item => <span key={item}>{item}</span>)}
        </Fragment>
      );

      expect(vnode.type).toBe(Fragment);
      expect(vnode.children.length).toBe(3);
    });

    it('should handle Fragment with key attribute', () => {
      const vnode = (
        <Fragment key="fragment-key">
          <div>Content</div>
        </Fragment>
      );

      expect(vnode.key).toBe('fragment-key');
    });

    it('should handle mixed Fragments and elements', () => {
      const vnode = (
        <div>
          <span>Before</span>
          <Fragment>
            <p>Inside 1</p>
            <p>Inside 2</p>
          </Fragment>
          <span>After</span>
        </div>
      );

      expect(vnode.children).toHaveLength(3);
    });
  });

  describe('Advanced Style Handling', () => {
    it('should handle camelCase style properties', () => {
      const vnode = (
        <div style={{ backgroundColor: 'blue', fontSize: '16px', marginTop: '10px' }}>
          Styled
        </div>
      );

      expect(vnode.props.style.backgroundColor).toBe('blue');
      expect(vnode.props.style.fontSize).toBe('16px');
      expect(vnode.props.style.marginTop).toBe('10px');
    });

    it('should handle CSS variables in style', () => {
      const vnode = (
        <div style={{ '--custom-color': 'red', '--spacing': '8px' } as any}>
          Custom
        </div>
      );

      expect(vnode.props.style['--custom-color']).toBe('red');
    });

    it('should handle numeric values in style', () => {
      const vnode = <div style={{ width: 100, height: 200, opacity: 0.5 }}>Sized</div>;

      expect(vnode.props.style.width).toBe(100);
      expect(vnode.props.style.height).toBe(200);
      expect(vnode.props.style.opacity).toBe(0.5);
    });

    it('should handle empty style object', () => {
      const vnode = <div style={{}}>Empty style</div>;

      expect(vnode.props.style).toEqual({});
    });

    it('should handle undefined style', () => {
      const vnode = <div style={undefined}>No style</div>;

      expect(vnode.props.style).toBeUndefined();
    });

    it('should handle multiple className values', () => {
      const baseClass = 'base';
      const extraClass = 'extra';
      const vnode = <div className={`${baseClass} ${extraClass}`}>Multi-class</div>;

      expect(vnode.props.className).toBe('base extra');
    });

    it('should handle dynamic className', () => {
      const isActive = true;
      const vnode = <div className={isActive ? 'active' : 'inactive'}>Dynamic</div>;

      expect(vnode.props.className).toBe('active');
    });
  });
});

