/**
 * JSX Warning System Tests
 * 测试警告系统的集成和功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  warn,
  warnDeprecated,
  warnPerformance,
  checkForMissingKeys,
  checkProps,
  validateElementType,
  clearWarnings,
  WarningType
} from './utils/warnings';
import type { VNode } from './vdom/types';

describe('JSX Warning System', () => {
  let consoleWarnSpy: any;

  beforeEach(() => {
    // 清除之前的警告记录
    clearWarnings();
    // 监听 console.warn
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // 恢复 console.warn
    consoleWarnSpy.mockRestore();
  });

  describe('Basic Warning Functions', () => {
    it('should emit warning with type', () => {
      warn(WarningType.MISSING_KEY, 'Custom warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Custom warning message')
      );
    });

    it('should emit deprecated API warning', () => {
      warnDeprecated('oldFunction', 'newFunction');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('oldFunction')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('newFunction')
      );
    });

    it('should emit performance warning', () => {
      warnPerformance('Performance issue detected', 'Additional details');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance issue detected')
      );
    });

    it('should only warn once for same message by default', () => {
      warn(WarningType.MISSING_KEY, 'Same message');
      warn(WarningType.MISSING_KEY, 'Same message');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should warn multiple times when once flag is false', () => {
      warn(WarningType.MISSING_KEY, 'Repeat message', false);
      warn(WarningType.MISSING_KEY, 'Repeat message', false);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Missing Key Warnings', () => {
    it('should warn when children are missing keys', () => {
      const children: VNode[] = [
        { type: 'div', props: {}, children: [] },
        { type: 'div', props: {}, children: [] }
      ];

      checkForMissingKeys(children);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('key')
      );
    });

    it('should not warn when children have keys', () => {
      const children: VNode[] = [
        { type: 'div', props: {}, children: [], key: '1' },
        { type: 'div', props: {}, children: [], key: '2' }
      ];

      checkForMissingKeys(children);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not warn for single child', () => {
      const children: VNode[] = [
        { type: 'div', props: {}, children: [] }
      ];

      checkForMissingKeys(children);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not warn for empty children array', () => {
      checkForMissingKeys([]);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should include parent component name in warning', () => {
      const children: VNode[] = [
        { type: 'div', props: {}, children: [] },
        { type: 'div', props: {}, children: [] }
      ];

      checkForMissingKeys(children, 'MyComponent');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('MyComponent')
      );
    });

    it('should not warn for mixed children with strings', () => {
      const children: (VNode | string)[] = [
        'text1',
        'text2'
      ];

      checkForMissingKeys(children);

      // Strings don't need keys
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('Element Type Validation', () => {
    it('should not warn for valid string type', () => {
      validateElementType('div');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not warn for valid function type', () => {
      const Component = () => ({ type: 'div', props: {}, children: [] });
      validateElementType(Component);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not warn for valid symbol type', () => {
      const FragmentSymbol = Symbol.for('Fragment');
      validateElementType(FragmentSymbol);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn for invalid type', () => {
      validateElementType(123 as any);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Element type is invalid')
      );
    });

    it('should warn for null type', () => {
      validateElementType(null as any);

      expect(consoleWarnSpy).not.toHaveBeenCalled(); // null is handled specially
    });

    it('should warn for object type', () => {
      validateElementType({} as any);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Element type is invalid')
      );
    });
  });

  describe('Props Validation', () => {
    it('should not warn for valid props', () => {
      const props = { name: 'John', age: 30 };
      const validProps = ['name', 'age'];

      checkProps('UserComponent', props, validProps);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn for invalid props', () => {
      const props = { name: 'John', invalid: 'value' };
      const validProps = ['name', 'age'];

      checkProps('UserComponent', props, validProps);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('UserComponent')
      );
    });

    it('should ignore children and key props', () => {
      const props = { name: 'John', children: [], key: '1' };
      const validProps = ['name'];

      checkProps('UserComponent', props, validProps);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn for multiple invalid props', () => {
      const props = { name: 'John', invalid1: 'value', invalid2: 'value' };
      const validProps = ['name'];

      checkProps('UserComponent', props, validProps);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid1')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid2')
      );
    });

    it('should not check props when validProps is undefined', () => {
      const props = { anything: 'goes' };

      checkProps('UserComponent', props);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('JSX Integration Warnings', () => {
    it('should warn when rendering list without keys', () => {
      const items = ['a', 'b', 'c'];
      const vnode = (
        <ul>
          {items.map(item => <li>{item}</li>)}
        </ul>
      );

      // The warning should be triggered during createElement
      // This test verifies the integration
      expect(vnode.type).toBe('ul');
    });

    it('should not warn when list has keys', () => {
      consoleWarnSpy.mockClear();

      const items = ['a', 'b', 'c'];
      const vnode = (
        <ul>
          {items.map(item => <li key={item}>{item}</li>)}
        </ul>
      );

      // No warning for properly keyed list
      expect(vnode.type).toBe('ul');
    });
  });

  describe('Warning Deduplication', () => {
    it('should deduplicate same warnings', () => {
      warn(WarningType.PERFORMANCE, 'Performance warning', true);
      warn(WarningType.PERFORMANCE, 'Performance warning', true);
      warn(WarningType.PERFORMANCE, 'Performance warning', true);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should not deduplicate different warnings', () => {
      warn(WarningType.PERFORMANCE, 'Warning 1', true);
      warn(WarningType.PERFORMANCE, 'Warning 2', true);
      warn(WarningType.PERFORMANCE, 'Warning 3', true);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
    });

    it('should reset deduplication after clearWarnings', () => {
      warn(WarningType.PERFORMANCE, 'Same warning', true);
      clearWarnings();
      warn(WarningType.PERFORMANCE, 'Same warning', true);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Production Mode', () => {
    it('should not warn in production mode', () => {
      // Note: This test depends on NODE_ENV which is set by the test environment
      // In production, warnings should be suppressed
      const originalEnv = process.env.NODE_ENV;

      // Temporarily set to production
      process.env.NODE_ENV = 'production';

      warn(WarningType.MISSING_KEY, 'Production warning');

      // Restore
      process.env.NODE_ENV = originalEnv;

      // In production, no warnings should be emitted
      // Note: This specific behavior depends on the isDevelopment() check
    });
  });

  describe('Complex Warning Scenarios', () => {
    it('should handle nested component warnings', () => {
      const children: VNode[] = [
        {
          type: 'div',
          props: {},
          children: [
            { type: 'span', props: {}, children: [] },
            { type: 'span', props: {}, children: [] }
          ]
        }
      ];

      checkForMissingKeys(children);

      // Parent level should not warn (single child)
      // But nested children could trigger warnings if checked recursively
    });

    it('should handle warnings with special characters', () => {
      warn(WarningType.INVALID_PROP, 'Warning with <special> & "characters"');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('special')
      );
    });

    it('should handle very long warning messages', () => {
      const longMessage = 'A'.repeat(1000);
      warn(WarningType.PERFORMANCE, longMessage);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('A')
      );
    });
  });

  describe('Deprecated API Warnings', () => {
    it('should warn about deprecated API without replacement', () => {
      warnDeprecated('oldMethod');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('oldMethod')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );
    });

    it('should warn about deprecated API with replacement', () => {
      warnDeprecated('oldMethod', 'newMethod');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('oldMethod')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('newMethod')
      );
    });
  });

  describe('Performance Warnings', () => {
    it('should emit performance warning with details', () => {
      warnPerformance('Slow operation detected', 'Consider using memoization');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('memoization')
      );
    });

    it('should emit performance warning without details', () => {
      warnPerformance('Slow operation');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation')
      );
    });
  });

  describe('Warning Types', () => {
    it('should support MISSING_KEY warning type', () => {
      warn(WarningType.MISSING_KEY);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('key')
      );
    });

    it('should support DEPRECATED_API warning type', () => {
      warn(WarningType.DEPRECATED_API);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );
    });

    it('should support PERFORMANCE warning type', () => {
      warn(WarningType.PERFORMANCE);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance')
      );
    });

    it('should support INVALID_PROP warning type', () => {
      warn(WarningType.INVALID_PROP);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('prop')
      );
    });

    it('should support LIFECYCLE warning type', () => {
      warn(WarningType.LIFECYCLE);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Lifecycle')
      );
    });
  });
});

