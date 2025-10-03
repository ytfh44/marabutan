import { describe, it, expect } from 'vitest';
import { shallowEqual, deepEqual, shallowEqualArrays } from './comparison';

describe('Comparison utilities', () => {
  describe('shallowEqual', () => {
    it('should return true for identical references', () => {
      const obj = { a: 1, b: 2 };
      expect(shallowEqual(obj, obj)).toBe(true);
    });

    it('should return true for objects with same primitive values', () => {
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(shallowEqual({ x: 'hello' }, { x: 'hello' })).toBe(true);
      expect(shallowEqual({ flag: true }, { flag: true })).toBe(true);
    });

    it('should return false for objects with different values', () => {
      expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(shallowEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('should return false for objects with different key counts', () => {
      expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });

    it('should handle function references correctly', () => {
      const fn1 = () => {};
      const fn2 = () => {};
      
      // 相同引用
      expect(shallowEqual({ onClick: fn1 }, { onClick: fn1 })).toBe(true);
      
      // 不同引用
      expect(shallowEqual({ onClick: fn1 }, { onClick: fn2 })).toBe(false);
    });

    it('should handle nested objects as references', () => {
      const nested = { x: 1 };
      
      // 相同引用
      expect(shallowEqual({ data: nested }, { data: nested })).toBe(true);
      
      // 不同引用（浅比较不会递归）
      expect(shallowEqual({ data: { x: 1 } }, { data: { x: 1 } })).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(shallowEqual(null, null)).toBe(true);
      expect(shallowEqual(undefined, undefined)).toBe(true);
      expect(shallowEqual(null, undefined)).toBe(false);
      expect(shallowEqual({}, null)).toBe(false);
      expect(shallowEqual(null, {})).toBe(false);
    });

    it('should handle empty objects', () => {
      expect(shallowEqual({}, {})).toBe(true);
    });

    it('should handle Symbol keys correctly', () => {
      const sym = Symbol('test');
      const obj1 = { [sym]: 'value' };
      const obj2 = { [sym]: 'value' };
      
      // Symbol keys are not enumerable by Object.keys
      // So these should be equal (both have no enumerable keys)
      expect(shallowEqual(obj1, obj2)).toBe(true);
    });

    it('should not throw on circular references', () => {
      const obj1: any = { a: 1 };
      obj1.self = obj1;
      
      const obj2: any = { a: 1 };
      obj2.self = obj2;
      
      // 不会抛出错误，因为只做浅比较
      expect(() => shallowEqual(obj1, obj2)).not.toThrow();
      // 结果为false（因为self引用不同）
      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3];
      expect(shallowEqual({ items: arr }, { items: arr })).toBe(true);
      expect(shallowEqual({ items: [1, 2] }, { items: [1, 2] })).toBe(false);
    });

    it('should be faster than JSON.stringify (performance test)', () => {
      const obj1 = {
        a: 1,
        b: 'string',
        c: true,
        d: null,
        e: () => {},
        f: { nested: 'object' }
      };
      
      const obj2 = { ...obj1 };
      
      const iterations = 10000;
      
      // shallowEqual
      const start1 = performance.now();
      for (let i = 0; i < iterations; i++) {
        shallowEqual(obj1, obj2);
      }
      const time1 = performance.now() - start1;
      
      // JSON.stringify (会失败因为有函数，但我们测试try-catch的性能)
      const start2 = performance.now();
      for (let i = 0; i < iterations; i++) {
        try {
          JSON.stringify(obj1) === JSON.stringify(obj2);
        } catch (e) {
          // 忽略
        }
      }
      const time2 = performance.now() - start2;
      
      console.log(`shallowEqual: ${time1}ms, JSON.stringify: ${time2}ms`);
      // shallowEqual 应该明显更快
      expect(time1).toBeLessThan(time2);
    });
  });

  describe('deepEqual', () => {
    it('should compare nested objects deeply', () => {
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it('should compare arrays deeply', () => {
      expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(deepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
    });

    it('should handle mixed structures', () => {
      const obj1 = {
        a: 1,
        b: [2, 3],
        c: { d: 4 }
      };
      const obj2 = {
        a: 1,
        b: [2, 3],
        c: { d: 4 }
      };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should respect maxDepth limit', () => {
      const deep1 = { a: { b: { c: { d: 1 } } } };
      const deep2 = { a: { b: { c: { d: 2 } } } };
      
      // maxDepth=2 不够深入比较
      expect(deepEqual(deep1, deep2, 2)).toBe(false);
      // maxDepth=5 足够深入
      expect(deepEqual(deep1, deep2, 5)).toBe(false);
    });

    it('should handle primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('test', 'test')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(1, 2)).toBe(false);
    });

    it('should prevent infinite recursion on circular references', () => {
      const obj1: any = { a: 1 };
      obj1.self = obj1;
      
      const obj2: any = { a: 1 };
      obj2.self = obj2;
      
      // 不会栈溢出（因为有maxDepth限制）
      expect(() => deepEqual(obj1, obj2, 5)).not.toThrow();
    });
  });

  describe('shallowEqualArrays', () => {
    it('should compare arrays by reference equality', () => {
      expect(shallowEqualArrays([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(shallowEqualArrays([1, 2], [1, 2, 3])).toBe(false);
    });

    it('should handle object references in arrays', () => {
      const obj = { a: 1 };
      expect(shallowEqualArrays([obj], [obj])).toBe(true);
      expect(shallowEqualArrays([{ a: 1 }], [{ a: 1 }])).toBe(false);
    });

    it('should handle identical references', () => {
      const arr = [1, 2, 3];
      expect(shallowEqualArrays(arr, arr)).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(shallowEqualArrays(null as any, [])).toBe(false);
      expect(shallowEqualArrays([] as any, null as any)).toBe(false);
      expect(shallowEqualArrays({} as any, [])).toBe(false);
    });
  });
});

