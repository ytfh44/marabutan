import { describe, it, expect, vi } from 'vitest';
import { memo, pure, memoWithName } from './memo';
import { createElement } from '../vdom/createElement';
import type { VNode } from '../vdom/types';

describe('Memo Component', () => {
  describe('memo', () => {
    it('should cache result when props are equal', () => {
      const renderFn = vi.fn((props: { value: number }) =>
        createElement('div', {}, props.value.toString())
      );
      const MemoComponent = memo(renderFn);

      const props1 = { value: 1 };
      const result1 = MemoComponent(props1);
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Same props (by reference)
      const result2 = MemoComponent(props1);
      expect(renderFn).toHaveBeenCalledTimes(1); // Should not call again
      expect(result2).toBe(result1); // Should return cached VNode
    });

    it('should re-render when props change', () => {
      const renderFn = vi.fn((props: { value: number }) =>
        createElement('div', {}, props.value.toString())
      );
      const MemoComponent = memo(renderFn);

      const props1 = { value: 1 };
      const result1 = MemoComponent(props1);
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Different props
      const props2 = { value: 2 };
      const result2 = MemoComponent(props2);
      expect(renderFn).toHaveBeenCalledTimes(2);
      expect(result2).not.toBe(result1);
    });

    it('should use shallow comparison by default', () => {
      const renderFn = vi.fn((props: { data: { x: number } }) =>
        createElement('div', {}, props.data.x.toString())
      );
      const MemoComponent = memo(renderFn);

      const data = { x: 1 };
      const props1 = { data };
      MemoComponent(props1);
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Same data reference
      const props2 = { data };
      MemoComponent(props2);
      expect(renderFn).toHaveBeenCalledTimes(1); // No re-render

      // Different data reference (even though value is same)
      const props3 = { data: { x: 1 } };
      MemoComponent(props3);
      expect(renderFn).toHaveBeenCalledTimes(2); // Re-render
    });

    it('should support custom comparison function', () => {
      const renderFn = vi.fn((props: { user: { id: number; name: string } }) =>
        createElement('div', {}, props.user.name)
      );

      // Only re-render if user ID changes
      const MemoComponent = memo(
        renderFn,
        (prev, next) => prev.user.id === next.user.id
      );

      MemoComponent({ user: { id: 1, name: 'Alice' } });
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Same ID, different name - should NOT re-render
      MemoComponent({ user: { id: 1, name: 'Alicia' } });
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Different ID - should re-render
      MemoComponent({ user: { id: 2, name: 'Bob' } });
      expect(renderFn).toHaveBeenCalledTimes(2);
    });

    it('should handle null/undefined props', () => {
      const renderFn = vi.fn((props: { value?: number }) =>
        createElement('div', {}, String(props.value || 0))
      );
      const MemoComponent = memo(renderFn);

      MemoComponent({ value: undefined });
      expect(renderFn).toHaveBeenCalledTimes(1);

      MemoComponent({ value: undefined });
      expect(renderFn).toHaveBeenCalledTimes(1); // No re-render

      MemoComponent({ value: 1 });
      expect(renderFn).toHaveBeenCalledTimes(2);
    });

    it('should handle function props correctly', () => {
      const renderFn = vi.fn((props: { onClick: () => void; label: string }) =>
        createElement('button', { onClick: props.onClick }, props.label)
      );
      const MemoComponent = memo(renderFn);

      const onClick = () => {};
      MemoComponent({ onClick, label: 'Click' });
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Same function reference
      MemoComponent({ onClick, label: 'Click' });
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Different function reference
      MemoComponent({ onClick: () => {}, label: 'Click' });
      expect(renderFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('pure', () => {
    it('should use deep comparison for props', () => {
      const renderFn = vi.fn((props: { config: { x: number; y: number } }) =>
        createElement('div', {}, `${props.config.x},${props.config.y}`)
      );
      const PureComponent = pure(renderFn);

      PureComponent({ config: { x: 1, y: 2 } });
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Different reference but same values - should NOT re-render
      PureComponent({ config: { x: 1, y: 2 } });
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Different values - should re-render
      PureComponent({ config: { x: 2, y: 3 } });
      expect(renderFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoWithName', () => {
    it('should attach display name to component', () => {
      const renderFn = (props: { value: number }) =>
        createElement('div', {}, props.value.toString());

      const MemoComponent = memoWithName('MyComponent', renderFn);

      expect((MemoComponent as any).displayName).toBe('MyComponent');
    });

    it('should still memoize correctly', () => {
      const renderFn = vi.fn((props: { value: number }) =>
        createElement('div', {}, props.value.toString())
      );

      const MemoComponent = memoWithName('MyComponent', renderFn);

      const props = { value: 1 };
      MemoComponent(props);
      MemoComponent(props);

      expect(renderFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('performance', () => {
    it('should significantly reduce render calls', () => {
      let renderCount = 0;
      const ExpensiveComponent = memo((props: { items: string[] }) => {
        renderCount++;
        // Simulate expensive calculation
        const result = props.items.map(item => item.toUpperCase()).join(',');
        return createElement('div', {}, result);
      });

      const items = ['a', 'b', 'c'];
      const props = { items };

      // Render 100 times with same props
      for (let i = 0; i < 100; i++) {
        ExpensiveComponent(props);
      }

      // Should only render once
      expect(renderCount).toBe(1);
    });

    it('should be faster than non-memoized component', () => {
      const regularFn = (props: { value: number }) =>
        createElement('div', {}, props.value.toString());

      const memoFn = memo(regularFn);

      const props = { value: 1 };

      const regularStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        regularFn(props);
      }
      const regularTime = performance.now() - regularStart;

      const memoStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        memoFn(props);
      }
      const memoTime = performance.now() - memoStart;

      console.log(`Regular: ${regularTime}ms, Memo: ${memoTime}ms`);
      // Memo should be significantly faster (though results may vary)
      expect(memoTime).toBeLessThan(regularTime);
    });
  });

  describe('edge cases', () => {
    it('should handle component returning null', () => {
      const renderFn = vi.fn((props: { show: boolean }) =>
        props.show ? createElement('div', {}, 'visible') : null
      );
      const MemoComponent = memo(renderFn);

      const props = { show: false };
      MemoComponent(props);
      expect(renderFn).toHaveBeenCalledTimes(1);

      // Same props reference - should not re-render
      MemoComponent(props);
      expect(renderFn).toHaveBeenCalledTimes(1);
    });

    it('should handle empty props', () => {
      const renderFn = vi.fn(() => createElement('div', {}, 'empty'));
      const MemoComponent = memo(renderFn);

      MemoComponent({});
      MemoComponent({});

      expect(renderFn).toHaveBeenCalledTimes(1);
    });

    it('should work with multiple memo layers', () => {
      const innerFn = vi.fn((props: { value: number }) =>
        createElement('span', {}, props.value.toString())
      );
      const Inner = memo(innerFn);

      const outerFn = vi.fn((props: { value: number }) =>
        Inner({ value: props.value })
      );
      const Outer = memo(outerFn);

      const props = { value: 1 };
      Outer(props);
      Outer(props);
      Outer(props);

      // Outer should only render once
      expect(outerFn).toHaveBeenCalledTimes(1);
      // Inner should also only render once
      expect(innerFn).toHaveBeenCalledTimes(1);
    });
  });
});

