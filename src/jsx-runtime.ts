import { createElement, Fragment as VFragment } from './vdom/createElement';
import type { VNode, ComponentType, Props } from './vdom/types';

/**
 * JSX Runtime for Marabutan Framework
 * Provides JSX factory functions compatible with TypeScript JSX compilation
 */

/**
 * Fragment component for grouping children without a wrapper element
 */
export const Fragment = VFragment;

/**
 * JSX factory function - creates virtual DOM elements
 * This function is called by the JSX compiler when transforming JSX syntax
 */
export function jsx(
  type: ComponentType,
  props: Props | null = {},
  key?: string | number
): VNode {
  // Handle null props
  const actualProps = props || {};
  
  // Extract children from props if present
  const { children, key: propsKey, ...restProps } = actualProps;

  // Use key parameter if provided, otherwise use key from props
  const finalKey = key !== undefined ? key : propsKey;

  // If children exist, spread them as additional arguments to createElement
  if (children !== undefined) {
    const vnode = Array.isArray(children)
      ? createElement(type, restProps, ...children)
      : createElement(type, restProps, children);
    
    // Set key if present
    if (finalKey !== undefined && finalKey !== null) {
      vnode.key = finalKey as string | number;
    }
    
    return vnode;
  }

  const vnode = createElement(type, restProps);
  
  // Set key if present
  if (finalKey !== undefined && finalKey !== null) {
    vnode.key = finalKey as string | number;
  }
  
  return vnode;
}

/**
 * JSX development factory function (for development mode)
 * Includes additional debugging information
 */
export function jsxDEV(
  type: ComponentType,
  props: Props | null = {},
  key?: string | number,
  __source?: unknown,
  __self?: unknown
): VNode {
  // In development, you could add source map information here
  // For now, just call the regular jsx function
  return jsx(type, props, key);
}

/**
 * JavaScript environment detection
 */
export function jsxs(
  type: ComponentType,
  props: Props | null = {},
  key?: string | number
): VNode {
  return jsx(type, props, key);
}
