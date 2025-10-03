/**
 * JSX Regression Tests
 * 测试已修复的 bug 和边界情况，防止回归
 */

import { describe, it, expect } from 'vitest';
import { jsx, jsxs, Fragment } from './jsx-runtime';
import { createElement } from './vdom/createElement';

describe('JSX Regression Tests', () => {
  describe('Key Handling Regressions', () => {
    it('should prioritize key parameter over props.key', () => {
      // Regression: key parameter was being ignored when props.key also exists
      const vnode = jsx('div', { key: 'props-key' }, 'param-key');

      expect(vnode.key).toBe('param-key');
    });

    it('should use props.key when key parameter is undefined', () => {
      const vnode = jsx('div', { key: 'props-key' }, undefined);

      expect(vnode.key).toBe('props-key');
    });

    it('should handle key=0 correctly', () => {
      // Regression: key=0 was being treated as falsy
      const vnode = <div key={0}>Content</div>;

      expect(vnode.key).toBe(0);
    });

    it('should handle empty string key', () => {
      const vnode = <div key="">Content</div>;

      expect(vnode.key).toBe('');
    });
  });

  describe('Children Normalization Regressions', () => {
    it('should filter out false but not 0', () => {
      // Regression: 0 was being filtered out along with false
      const vnode = <div>{0}{false}</div>;

      // 0 should be rendered, false should be filtered
      const hasZero = vnode.children.some(child => {
        if (typeof child === 'object' && 'children' in child) {
          return child.children.some(c => c === '0');
        }
        return false;
      });

      expect(hasZero).toBe(true);
    });

    it('should handle empty array children', () => {
      // Regression: empty arrays were causing issues
      const vnode = <div>{[]}</div>;

      expect(vnode.type).toBe('div');
      expect(vnode.children).toBeDefined();
    });

    it('should flatten nested arrays correctly', () => {
      // Regression: deeply nested arrays weren't being flattened
      const vnode = <div>{[[[1, 2]], [[3, 4]]]}</div>;

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle mixed null and undefined in children', () => {
      const vnode = (
        <div>
          {null}
          {undefined}
          <span>Valid</span>
          {null}
        </div>
      );

      // Should only have one valid child
      expect(vnode.children.length).toBe(1);
      expect(vnode.children[0].type).toBe('span');
    });
  });

  describe('Props Handling Regressions', () => {
    it('should not mutate original props object', () => {
      // Regression: props object was being mutated
      const originalProps = { className: 'test', key: 'k1' };
      const vnode = <div {...originalProps}>Content</div>;

      expect(originalProps.key).toBe('k1');
      expect(vnode.props).not.toBe(originalProps);
    });

    it('should handle null props correctly', () => {
      const vnode = jsx('div', null);

      expect(vnode.props).toBeDefined();
      expect(vnode.type).toBe('div');
    });

    it('should handle undefined props', () => {
      const vnode = jsx('div', undefined);

      expect(vnode.props).toBeDefined();
    });

    it('should spread props in correct order', () => {
      // Regression: later props weren't overriding earlier ones
      const vnode = <div className="first" {...{ className: 'second' }} className="third">Content</div>;

      expect(vnode.props.className).toBe('third');
    });
  });

  describe('Function Component Regressions', () => {
    it('should handle function component returning null', () => {
      // Regression: null return was causing errors
      const NullComponent = () => null;
      const vnode = <NullComponent />;

      expect(vnode.type).toBe('');
      expect(vnode.children).toEqual(['']);
    });

    it('should handle function component returning undefined', () => {
      const UndefinedComponent = () => undefined as any;
      const vnode = <UndefinedComponent />;

      expect(vnode.type).toBe('');
    });

    it('should pass children correctly to function components', () => {
      // Regression: children were being wrapped in extra array
      const Container = (props: any) => {
        expect(props.children).toBeDefined();
        return <div>{props.children}</div>;
      };

      const vnode = (
        <Container>
          <span>Child</span>
        </Container>
      );

      expect(vnode.type).toBe('div');
    });

    it('should handle function component with single child', () => {
      const Wrapper = (props: any) => <div>{props.children}</div>;

      const vnode = <Wrapper>Single child</Wrapper>;

      expect(vnode.type).toBe('div');
    });

    it('should handle function component with multiple children', () => {
      const Wrapper = (props: any) => <div>{props.children}</div>;

      const vnode = (
        <Wrapper>
          <span>First</span>
          <span>Second</span>
        </Wrapper>
      );

      expect(vnode.type).toBe('div');
    });
  });

  describe('Fragment Regressions', () => {
    it('should handle Fragment with single child', () => {
      // Regression: single child in Fragment was causing issues
      const vnode = (
        <Fragment>
          <div>Only child</div>
        </Fragment>
      );

      expect(vnode.type).toBe(Fragment);
      expect(vnode.children.length).toBe(1);
    });

    it('should handle empty Fragment', () => {
      const vnode = <Fragment />;

      expect(vnode.type).toBe(Fragment);
      expect(vnode.children.length).toBe(0);
    });

    it('should handle Fragment with key', () => {
      // Regression: Fragment keys were being ignored
      const vnode = <Fragment key="fragment-key">Content</Fragment>;

      expect(vnode.key).toBe('fragment-key');
    });

    it('should handle nested Fragments correctly', () => {
      const vnode = (
        <Fragment>
          <Fragment>
            <div>Nested</div>
          </Fragment>
        </Fragment>
      );

      expect(vnode.type).toBe(Fragment);
      expect(vnode.children.length).toBe(1);
      expect(vnode.children[0].type).toBe(Fragment);
    });
  });

  describe('Event Handler Regressions', () => {
    it('should preserve event handler references', () => {
      // Regression: event handlers were being wrapped unnecessarily
      const handler = () => console.log('clicked');
      const vnode = <button onClick={handler}>Click</button>;

      expect(vnode.props.onClick).toBe(handler);
    });

    it('should handle inline arrow functions', () => {
      const vnode = <button onClick={() => {}}>Click</button>;

      expect(typeof vnode.props.onClick).toBe('function');
    });

    it('should handle multiple event handlers on same element', () => {
      const click = () => {};
      const hover = () => {};
      
      const vnode = <div onClick={click} onMouseEnter={hover}>Content</div>;

      expect(vnode.props.onClick).toBe(click);
      expect(vnode.props.onMouseEnter).toBe(hover);
    });
  });

  describe('Style Handling Regressions', () => {
    it('should handle style object correctly', () => {
      // Regression: style object was being stringified
      const styles = { color: 'red', fontSize: '16px' };
      const vnode = <div style={styles}>Styled</div>;

      expect(vnode.props.style).toEqual(styles);
      expect(typeof vnode.props.style).toBe('object');
    });

    it('should handle style string correctly', () => {
      const vnode = <div style="color: blue;">Styled</div>;

      expect(vnode.props.style).toBe('color: blue;');
      expect(typeof vnode.props.style).toBe('string');
    });

    it('should handle undefined style', () => {
      const vnode = <div style={undefined}>No style</div>;

      expect(vnode.props.style).toBeUndefined();
    });

    it('should handle null style', () => {
      const vnode = <div style={null as any}>No style</div>;

      expect(vnode.props.style).toBeNull();
    });
  });

  describe('Boolean Attribute Regressions', () => {
    it('should handle disabled=true correctly', () => {
      const vnode = <input disabled={true} />;

      expect(vnode.props.disabled).toBe(true);
    });

    it('should handle disabled=false correctly', () => {
      // Regression: false was being filtered out
      const vnode = <input disabled={false} />;

      expect(vnode.props.disabled).toBe(false);
    });

    it('should handle checked=true', () => {
      const vnode = <input type="checkbox" checked={true} />;

      expect(vnode.props.checked).toBe(true);
    });

    it('should handle checked=false', () => {
      const vnode = <input type="checkbox" checked={false} />;

      expect(vnode.props.checked).toBe(false);
    });
  });

  describe('jsx vs jsxs Consistency', () => {
    it('should produce same result for jsx and jsxs with single child', () => {
      const jsxVnode = jsx('div', { children: 'child' });
      const jsxsVnode = jsxs('div', { children: 'child' });

      expect(jsxVnode.type).toBe(jsxsVnode.type);
      expect(jsxVnode.children.length).toBeGreaterThan(0);
    });

    it('should produce same result for jsx and jsxs with multiple children', () => {
      const children = [jsx('span', {}, '1'), jsx('span', {}, '2')];
      const jsxVnode = jsx('div', { children });
      const jsxsVnode = jsxs('div', { children });

      expect(jsxVnode.type).toBe(jsxsVnode.type);
      expect(jsxVnode.children.length).toBe(jsxsVnode.children.length);
    });
  });

  describe('Text Node Regressions', () => {
    it('should handle numeric zero as text', () => {
      // Regression: 0 was being filtered out
      const vnode = <div>{0}</div>;

      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle empty string', () => {
      const vnode = <div>{''}</div>;

      expect(vnode.type).toBe('div');
    });

    it('should handle whitespace strings', () => {
      const vnode = <div>{'   '}</div>;

      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle newlines in text', () => {
      const vnode = <div>{'Line 1\nLine 2'}</div>;

      expect(vnode.type).toBe('div');
    });
  });

  describe('createElement vs JSX Consistency', () => {
    it('should produce same result', () => {
      const jsxVnode = <div className="test">Content</div>;
      const createElementVnode = createElement('div', { className: 'test' }, 'Content');

      expect(jsxVnode.type).toBe(createElementVnode.type);
      expect(jsxVnode.props.className).toBe(createElementVnode.props.className);
    });

    it('should handle children the same way', () => {
      const jsxVnode = (
        <div>
          <span>1</span>
          <span>2</span>
        </div>
      );

      const createElementVnode = createElement(
        'div',
        {},
        createElement('span', {}, '1'),
        createElement('span', {}, '2')
      );

      expect(jsxVnode.children.length).toBe(createElementVnode.children.length);
    });
  });

  describe('SVG Regressions', () => {
    it('should handle SVG attributes correctly', () => {
      // Regression: strokeWidth was being converted to stroke-width
      const vnode = <path strokeWidth="2" />;

      expect(vnode.props.strokeWidth).toBe('2');
    });

    it('should handle viewBox attribute', () => {
      const vnode = <svg viewBox="0 0 100 100">Content</svg>;

      expect(vnode.props.viewBox).toBe('0 0 100 100');
    });

    it('should handle SVG namespace attributes', () => {
      const vnode = <svg xmlns="http://www.w3.org/2000/svg">Content</svg>;

      expect(vnode.props.xmlns).toBe('http://www.w3.org/2000/svg');
    });
  });

  describe('Special Characters Regressions', () => {
    it('should handle quotes in attributes', () => {
      const vnode = <div title='Title with "quotes"'>Content</div>;

      expect(vnode.props.title).toBe('Title with "quotes"');
    });

    it('should handle unicode characters', () => {
      const vnode = <div>你好世界</div>;

      expect(vnode.type).toBe('div');
    });

    it('should handle emoji', () => {
      const vnode = <div>🎉🚀</div>;

      expect(vnode.type).toBe('div');
    });

    it('should handle HTML entities in text', () => {
      const vnode = <div>&lt;html&gt;</div>;

      expect(vnode.type).toBe('div');
    });
  });

  describe('Array Children Regressions', () => {
    it('should handle array of mixed content', () => {
      // Regression: mixed arrays weren't being normalized correctly
      const vnode = <div>{[1, 'string', <span key="1">element</span>, null, false]}</div>;

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle array with only falsy values', () => {
      const vnode = <div>{[null, undefined, false]}</div>;

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBe(0);
    });

    it('should handle nested arrays with keys', () => {
      const vnode = (
        <div>
          {[[<span key="1">1</span>], [<span key="2">2</span>]]}
        </div>
      );

      expect(vnode.type).toBe('div');
    });
  });

  describe('Conditional Rendering Regressions', () => {
    it('should handle && with falsy values', () => {
      const vnode = (
        <div>
          {false && <span>Hidden</span>}
          {0 && <span>Hidden</span>}
          {'' && <span>Hidden</span>}
          {null && <span>Hidden</span>}
        </div>
      );

      expect(vnode.type).toBe('div');
    });

    it('should handle && with truthy values', () => {
      const vnode = (
        <div>
          {true && <span>Visible</span>}
          {1 && <span>Visible</span>}
          {'text' && <span>Visible</span>}
        </div>
      );

      expect(vnode.type).toBe('div');
      expect(vnode.children.length).toBeGreaterThan(0);
    });

    it('should handle ternary with complex expressions', () => {
      const condition = true;
      const vnode = (
        <div>
          {condition ? (
            <Fragment>
              <span>True 1</span>
              <span>True 2</span>
            </Fragment>
          ) : (
            <span>False</span>
          )}
        </div>
      );

      expect(vnode.type).toBe('div');
    });
  });

  describe('Performance Regression Tests', () => {
    it('should not slow down with large prop objects', () => {
      const largeProps: any = {};
      for (let i = 0; i < 100; i++) {
        largeProps[`prop${i}`] = `value${i}`;
      }

      const startTime = performance.now();
      const vnode = <div {...largeProps}>Content</div>;
      const endTime = performance.now();

      expect(vnode.type).toBe('div');
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not slow down with many children', () => {
      const children = Array(1000).fill(0).map((_, i) => <div key={i}>{i}</div>);

      const startTime = performance.now();
      const vnode = <div>{children}</div>;
      const endTime = performance.now();

      expect(vnode.type).toBe('div');
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});

