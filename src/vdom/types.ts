/**
 * Component function type - a function that accepts props and returns a VNode
 * 协变（covariant）在返回类型 P，逆变（contravariant）在参数类型
 */
export type ComponentFunction<P = any> = (props: P) => VNode | null;

/**
 * Component type - can be a string (HTML tag), function component, or symbol (Fragment)
 */
export type ComponentType = string | ComponentFunction | symbol;

/**
 * Props type - record of property values
 * 不变（invariant）- 既可读又可写
 */
export type Props = Record<string, unknown>;

/**
 * React-compatible node types
 */
export type ReactNode = VNode | string | number | boolean | null | undefined | ReactNode[];

/**
 * Virtual DOM Node interface with improved type safety
 * 不变（invariant）- VNode 对象的所有字段都可能被读取和修改
 */
export interface VNode {
  type: ComponentType;
  props: Props;
  children: (VNode | string | number)[];
  key?: string | number;
  el?: Element; // Reference to actual DOM element
}

/**
 * Props interface for VNode with better typing
 * 不变（invariant）在索引签名
 */
export interface VNodeProps {
  [key: string]: unknown;
  key?: string | number;
  children?: ReactNode;
}

/**
 * Patch operation types
 */
export type PatchOp =
  | { type: 'CREATE'; newVNode: VNode }
  | { type: 'UPDATE'; oldVNode: VNode; newVNode: VNode }
  | { type: 'DELETE'; oldVNode: VNode }
  | { type: 'REPLACE'; oldVNode: VNode; newVNode: VNode }
  | { type: 'MOVE'; vnode: VNode; fromIndex: number; toIndex: number };

/**
 * Patch result
 */
export interface PatchResult {
  patches: PatchOp[];
  newVNode?: VNode;
}

/**
 * Type guard - check if a value is a VNode
 */
export function isVNode(value: unknown): value is VNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'props' in value &&
    'children' in value
  );
}

/**
 * Type guard - check if a type is a component function
 */
export function isComponentFunction(type: unknown): type is ComponentFunction {
  return typeof type === 'function';
}

/**
 * Type guard - check if a type is a valid component type
 */
export function isValidComponentType(type: unknown): type is ComponentType {
  return (
    typeof type === 'string' ||
    typeof type === 'function' ||
    typeof type === 'symbol'
  );
}
