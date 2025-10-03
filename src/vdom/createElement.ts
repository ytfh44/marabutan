import type { VNode, ComponentType, Props, isVNode } from './types';
import { createVNode, createTextVNode } from './vnode';
import { validateElementType, checkForMissingKeys } from '../utils/warnings';
import { ProviderSymbol, ConsumerSymbol } from '../context';
import { contextRegistry } from '../context/registry';

/**
 * Fragment Symbol for grouping children without a wrapper element
 * Using Symbol.for ensures the same symbol across module boundaries
 */
export const Fragment = Symbol.for('Fragment');

/**
 * Check if a VNode is a Fragment
 */
export function isFragment(vnode: VNode): boolean {
  return vnode.type === Fragment;
}

/**
 * Flatten nested arrays of children (deprecated, kept for compatibility)
 * @deprecated Use normalizeChildren directly which now handles flattening internally
 */
export function flattenChildren(children: unknown[]): unknown[] {
  const result: unknown[] = [];
  
  function flatten(items: unknown[]): void {
    for (const item of items) {
      if (Array.isArray(item)) {
        flatten(item);
      } else {
        result.push(item);
      }
    }
  }
  
  flatten(children);
  return result;
}

/**
 * Normalize children by filtering and converting to VNodes
 * - Filters out null, undefined, false (boolean false is removed)
 * - Converts true to empty text node (React compatibility)
 * - Converts strings and numbers to text VNodes
 * - Keeps VNode objects as-is
 * 
 * @remarks
 * 优化版本：使用单遍递归遍历，减少中间数组分配
 * 直接在结果数组中构建，避免创建临时数组
 */
export function normalizeChildren(children: unknown[]): (VNode | string | number)[] {
  const result: (VNode | string | number)[] = [];
  
  /**
   * 递归扁平化并规范化children
   * 直接将有效的children添加到result数组，避免创建中间数组
   */
  function flattenAndNormalize(items: unknown[]): void {
    for (const item of items) {
      // Filter out null, undefined, false
      if (item === null || item === undefined || item === false) {
        continue;
      }
      
      // Convert true to nothing (React compatibility)
      if (item === true) {
        continue;
      }
      
      // Recursively flatten arrays
      if (Array.isArray(item)) {
        flattenAndNormalize(item);
        continue;
      }
      
      // Convert strings and numbers to text VNodes
      if (typeof item === 'string' || typeof item === 'number') {
        // Only create text VNode if it's not empty string
        if (item !== '' || typeof item === 'number') {
          result.push(createTextVNode(item));
        }
        continue;
      }
      
      // Keep VNode objects - use type guard
      if (typeof item === 'object' && item !== null && 'type' in item && 'props' in item && 'children' in item) {
        result.push(item as VNode);
        continue;
      }
    }
  }
  
  flattenAndNormalize(children);
  return result;
}

/**
 * JSX-compatible createElement function
 * Creates virtual DOM elements from JSX syntax
 * 
 * @param type - Element type (string tag name, Function component, or Fragment symbol)
 * @param props - Element properties (can be null)
 * @param children - Child elements (variadic)
 * 
 * @example
 * createElement('div', { className: 'container' }, 'Hello', createElement('span', {}, 'World'))
 */
export function createElement(
  type: ComponentType,
  props?: Props | null,
  ...children: unknown[]
): VNode {
  // Validate element type in development
  validateElementType(type);
  
  // Normalize props
  const actualProps = props || {};
  
  // Extract key from props if present
  const { key, ...restProps } = actualProps;
  
  // 特殊处理Provider
  if (type === ProviderSymbol) {
    const { contextId, value } = restProps;
    
    // 进入Provider作用域
    contextRegistry.enterProvider(contextId as symbol, value);
    
    // 扁平化和规范化children
    const flatChildren = flattenChildren(children);
    const childVNodes = normalizeChildren(flatChildren);
    
    // 退出Provider作用域
    contextRegistry.exitProvider();
    
    // 创建Provider VNode（用Fragment包装，避免额外DOM节点）
    return createVNode(Fragment, {}, childVNodes);
  }
  
  // 特殊处理Consumer
  if (type === ConsumerSymbol) {
    // Consumer的children已经在Consumer组件中渲染
    // 这里只需要返回渲染后的children
    const flatChildren = flattenChildren(children);
    const childVNodes = normalizeChildren(flatChildren);
    
    // 如果只有一个child，直接返回
    if (childVNodes.length === 1) {
      return childVNodes[0] as VNode;
    }
    
    // 否则用Fragment包装
    return createVNode(Fragment, {}, childVNodes);
  }
  
  // Handle Function Components
  // If type is a function, call it with props and children
  if (typeof type === 'function') {
    const componentProps = {
      ...restProps,
      children: children.length > 0 ? (children.length === 1 ? children[0] : children) : undefined
    };
    
    // Call the function component
    const result = type(componentProps);
    
    // If the function returns null or undefined, return an empty text node
    if (result === null || result === undefined) {
      return createTextVNode('');
    }
    
    return result;
  }
  
  // Normalize children
  const normalizedChildren = normalizeChildren(children);
  
  // Check for missing keys in lists (development only)
  if (normalizedChildren.length > 1) {
    checkForMissingKeys(normalizedChildren, typeof type === 'string' ? type : undefined);
  }
  
  // Create the VNode
  const vnode: VNode = {
    type,
    props: restProps,
    children: normalizedChildren,
  };
  
  // Add key if present
  if (key !== undefined && key !== null) {
    vnode.key = key as string | number;
  }
  
  return vnode;
}

// Export createVNode for direct use
export { createVNode, createTextVNode };

