/**
 * JSX Development Runtime for Marabutan Framework
 * Used during development with additional debugging support
 * 
 * This runtime is used when jsxImportSource is set and jsx: "react-jsx" is in development mode.
 * It provides enhanced debugging information and validation.
 */

import { createElement, Fragment as VFragment } from './vdom/createElement';
import type { VNode, ComponentType, Props } from './vdom/types';
import { validateElementType, warn, WarningType } from './utils/warnings';

/**
 * Fragment component for grouping children without a wrapper element
 */
export const Fragment = VFragment;

/**
 * Source location information for debugging
 */
export interface SourceLocation {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}

/**
 * JSX Development factory function with enhanced debugging
 * This is called by the JSX compiler in development mode
 * 
 * @param type - Element type (string tag name, Function component, or Fragment symbol)
 * @param props - Element properties
 * @param key - Optional key for list reconciliation
 * @param isStaticChildren - Whether children are static (optimization hint)
 * @param source - Source code location for debugging
 * @param self - The 'this' context where the element was created
 */
export function jsxDEV(
  type: ComponentType,
  props: Props | null = {},
  key?: string | number,
  isStaticChildren?: boolean,
  source?: SourceLocation,
  self?: unknown
): VNode {
  // Enhanced validation in development mode
  if (process.env.NODE_ENV !== 'production') {
    validateElementType(type);
    
    // Warn about common mistakes
    if (props) {
      // Check for class instead of className
      if ('class' in props && !('className' in props)) {
        warn(
          WarningType.INVALID_PROP,
          'Invalid prop "class" supplied to element. Did you mean "className"?',
          false
        );
      }
      
      // Check for for instead of htmlFor on label
      if (typeof type === 'string' && type === 'label' && 'for' in props && !('htmlFor' in props)) {
        warn(
          WarningType.INVALID_PROP,
          'Invalid prop "for" supplied to <label>. Did you mean "htmlFor"?',
          false
        );
      }
    }
  }
  
  // Handle null props
  const actualProps = props || {};
  
  // Extract children from props if present
  const { children, key: propsKey, ref, ...restProps } = actualProps;

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
    
    // Store debug info on vnode (not on props) in development mode
    // Only set debug properties if vnode is an object (not a primitive)
    if (process.env.NODE_ENV !== 'production' && typeof vnode === 'object' && vnode !== null) {
      if (source) {
        (vnode as any).__source = source;
      }
      if (self !== undefined) {
        (vnode as any).__self = self;
      }
    }
    
    return vnode;
  }

  const vnode = createElement(type, restProps);
  
  // Set key if present
  if (finalKey !== undefined && finalKey !== null) {
    vnode.key = finalKey as string | number;
  }
  
  // Store debug info on vnode (not on props) in development mode
  // Only set debug properties if vnode is an object (not a primitive)
  if (process.env.NODE_ENV !== 'production' && typeof vnode === 'object' && vnode !== null) {
    if (source) {
      (vnode as any).__source = source;
    }
    if (self !== undefined) {
      (vnode as any).__self = self;
    }
  }
  
  return vnode;
}

/**
 * JSX factory function - standard version for development
 * Provides same behavior as production but with validation
 */
export function jsx(
  type: ComponentType,
  props: Props | null = {},
  key?: string | number
): VNode {
  return jsxDEV(type, props, key);
}

/**
 * JSX factory function for static children (development)
 * Used when the compiler knows children are static
 */
export function jsxs(
  type: ComponentType,
  props: Props | null = {},
  key?: string | number
): VNode {
  return jsxDEV(type, props, key, true);
}

