/**
 * Development warnings and error messages
 * Only active in development mode
 */

import type { VNode } from '../vdom/types';

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV !== 'production';
};

/**
 * Warning types
 */
export enum WarningType {
  MISSING_KEY = 'MISSING_KEY',
  DEPRECATED_API = 'DEPRECATED_API',
  PERFORMANCE = 'PERFORMANCE',
  INVALID_PROP = 'INVALID_PROP',
  LIFECYCLE = 'LIFECYCLE',
}

/**
 * Warning message templates
 */
const warningMessages: Record<WarningType, string> = {
  [WarningType.MISSING_KEY]: 'Each child in a list should have a unique "key" prop.',
  [WarningType.DEPRECATED_API]: 'API is deprecated and will be removed in a future version.',
  [WarningType.PERFORMANCE]: 'Performance warning: potential optimization issue detected.',
  [WarningType.INVALID_PROP]: 'Invalid prop provided to component.',
  [WarningType.LIFECYCLE]: 'Lifecycle method called at inappropriate time.',
};

/**
 * Track which warnings have been shown to avoid spam
 */
const shownWarnings = new Set<string>();

/**
 * Emit a development warning
 * 
 * @param type - Warning type
 * @param message - Custom message (optional)
 * @param once - Only show this warning once
 */
export function warn(
  type: WarningType,
  message?: string,
  once: boolean = true
): void {
  if (!isDevelopment()) {
    return;
  }

  const finalMessage = message || warningMessages[type];
  const warningKey = `${type}:${finalMessage}`;

  // Skip if already shown and once flag is set
  if (once && shownWarnings.has(warningKey)) {
    return;
  }

  console.warn(`[Marabutan Warning] ${finalMessage}`);
  
  if (once) {
    shownWarnings.add(warningKey);
  }
}

/**
 * Check if a list of VNodes is missing keys
 * 
 * @param children - Array of VNodes
 * @param parentComponent - Optional parent component name for better error messages
 */
export function checkForMissingKeys(
  children: (VNode | string | number)[],
  parentComponent?: string
): void {
  if (!isDevelopment() || children.length <= 1) {
    return;
  }

  let hasKey = false;
  let hasVNode = false;

  for (const child of children) {
    if (typeof child === 'object' && 'type' in child) {
      hasVNode = true;
      if (child.key !== undefined) {
        hasKey = true;
        break;
      }
    }
  }

  // Warn if we have multiple VNode children but none have keys
  if (hasVNode && !hasKey && children.length > 1) {
    const location = parentComponent ? ` in ${parentComponent}` : '';
    warn(
      WarningType.MISSING_KEY,
      `Each child in a list should have a unique "key" prop${location}. ` +
      `Check the render method${location}.`,
      false // Show every time in lists
    );
  }
}

/**
 * Warn about deprecated API usage
 * 
 * @param oldApi - Deprecated API name
 * @param newApi - Recommended replacement
 */
export function warnDeprecated(oldApi: string, newApi?: string): void {
  const replacement = newApi ? ` Use ${newApi} instead.` : '';
  warn(
    WarningType.DEPRECATED_API,
    `"${oldApi}" is deprecated and will be removed in a future version.${replacement}`
  );
}

/**
 * Warn about performance issues
 * 
 * @param message - Performance warning message
 * @param details - Additional details
 */
export function warnPerformance(message: string, details?: string): void {
  const fullMessage = details ? `${message} ${details}` : message;
  warn(WarningType.PERFORMANCE, fullMessage);
}

/**
 * Check component tree depth
 * 
 * @param depth - Current depth
 * @param maxDepth - Maximum recommended depth
 */
export function checkTreeDepth(depth: number, maxDepth: number = 50): void {
  if (!isDevelopment()) {
    return;
  }

  if (depth > maxDepth) {
    warnPerformance(
      `Component tree depth (${depth}) exceeds recommended maximum (${maxDepth}).`,
      'Consider flattening your component structure for better performance.'
    );
  }
}

/**
 * Check for invalid props
 * 
 * @param componentName - Name of the component
 * @param props - Props object
 * @param validProps - List of valid prop names (optional)
 */
export function checkProps(
  componentName: string,
  props: Record<string, unknown>,
  validProps?: string[]
): void {
  if (!isDevelopment() || !validProps) {
    return;
  }

  const invalidProps = Object.keys(props).filter(
    prop => !validProps.includes(prop) && prop !== 'children' && prop !== 'key'
  );

  if (invalidProps.length > 0) {
    warn(
      WarningType.INVALID_PROP,
      `Invalid prop(s) "${invalidProps.join('", "')}" supplied to ${componentName}.`,
      false
    );
  }
}

/**
 * Clear all shown warnings (useful for testing)
 */
export function clearWarnings(): void {
  shownWarnings.clear();
}

/**
 * Validate element type
 * 
 * @param type - Element type
 */
export function validateElementType(type: unknown): void {
  if (!isDevelopment()) {
    return;
  }

  if (
    type !== null &&
    type !== undefined &&
    typeof type !== 'string' &&
    typeof type !== 'function' &&
    typeof type !== 'symbol'
  ) {
    warn(
      WarningType.INVALID_PROP,
      `Element type is invalid: expected a string (for built-in components) ` +
      `or a function (for composite components) but got: ${typeof type}.`
    );
  }
}

