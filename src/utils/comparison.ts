/**
 * Comparison utilities for Marabutan Framework
 * Provides efficient object comparison functions, avoiding JSON.stringify performance issues
 */

/**
 * Shallow compare two objects for equality
 * 
 * @param objA - First object
 * @param objB - Second object
 * @returns Returns true if all property values of both objects are the same (reference comparison)
 * 
 * @remarks
 * - Uses reference comparison (===), does not perform deep comparison
 * - Can correctly handle types that JSON.stringify cannot process, such as functions and Symbols
 * - Much faster than JSON.stringify and won't throw circular reference errors
 * 
 * @example
 * ```typescript
 * shallowEqual({ a: 1 }, { a: 1 }); // true
 * shallowEqual({ fn: () => {} }, { fn: () => {} }); // false (different function references)
 * const fn = () => {};
 * shallowEqual({ fn }, { fn }); // true (same function reference)
 * ```
 */
export function shallowEqual(objA: any, objB: any): boolean {
  // Reference equal, return true directly (including both null/undefined cases)
  if (objA === objB) {
    return true;
  }

  // If one is not an object (or is null), return false
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // Different number of keys, definitely not equal
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Check if each key's value is equal (shallow comparison)
  for (const key of keysA) {
    // Check if objB has this key
    if (!Object.prototype.hasOwnProperty.call(objB, key)) {
      return false;
    }

    // Compare values (reference comparison)
    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Deep compare two values for equality
 * 
 * @param a - First value
 * @param b - Second value
 * @param maxDepth - Maximum recursion depth to prevent infinite recursion (default 10 levels)
 * @returns Returns true if both values are deeply equal
 * 
 * @remarks
 * - Recursively compares objects and arrays
 * - Can handle nested objects
 * - Uses maxDepth to prevent stack overflow from circular references
 * - For large objects, performance overhead is significant
 * 
 * @example
 * ```typescript
 * deepEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true
 * deepEqual([1, [2, 3]], [1, [2, 3]]); // true
 * ```
 */
export function deepEqual(a: any, b: any, maxDepth: number = 10): boolean {
  // Reference equal
  if (a === b) {
    return true;
  }

  // Depth limit
  if (maxDepth <= 0) {
    return false;
  }

  // Handle null and undefined
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }

  // Different types
  const typeA = typeof a;
  const typeB = typeof b;
  if (typeA !== typeB) {
    return false;
  }

  // Non-object types
  if (typeA !== 'object') {
    return a === b;
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], maxDepth - 1)) {
        return false;
      }
    }
    return true;
  }

  // One is array, the other is not
  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  // Handle objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!deepEqual(a[key], b[key], maxDepth - 1)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if two arrays are shallowly equal
 * 
 * @param arrA - First array
 * @param arrB - Second array
 * @returns Returns true if both arrays have same length and each element is reference-equal
 */
export function shallowEqualArrays(arrA: any[], arrB: any[]): boolean {
  if (arrA === arrB) {
    return true;
  }

  if (!Array.isArray(arrA) || !Array.isArray(arrB)) {
    return false;
  }

  if (arrA.length !== arrB.length) {
    return false;
  }

  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }

  return true;
}

