import type { VNode, ComponentType, Props } from './types';

/**
 * Virtual Node utility functions
 * Provides helper functions for working with VNodes
 */

/**
 * Check if a VNode represents a text node
 * Text nodes have an empty string as type and a single string/number child
 */
export function isTextVNode(vnode: VNode): boolean {
  return vnode.type === '' && vnode.children.length === 1 && 
         (typeof vnode.children[0] === 'string' || typeof vnode.children[0] === 'number');
}

/**
 * Check if two VNodes have the same type and key
 * Used by the diff algorithm to determine if nodes can be updated or must be replaced
 */
export function isSameVNodeType(oldVNode: VNode, newVNode: VNode): boolean {
  // Compare type
  if (oldVNode.type !== newVNode.type) {
    return false;
  }

  // Compare key if present
  if (oldVNode.key !== undefined || newVNode.key !== undefined) {
    return oldVNode.key === newVNode.key;
  }

  return true;
}

/**
 * Create a basic VNode structure
 * This is a low-level function used by other VNode factories
 */
export function createVNode(
  type: ComponentType,
  props: Props = {},
  children: (VNode | string | number)[] = []
): VNode {
  return {
    type,
    props: props || {},
    children: children || [],
    key: props?.key as string | number | undefined
  };
}

/**
 * Create a text VNode
 * Text nodes are special VNodes with empty type string
 */
export function createTextVNode(text: string | number): VNode {
  return {
    type: '',
    props: {},
    children: [String(text)],
  };
}

