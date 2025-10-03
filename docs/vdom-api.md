# Virtual DOM API Documentation

## Overview

The Virtual DOM system provides efficient DOM updates through virtual node representation, diffing algorithms, and patch application.

## Core Types

### VNode

```typescript
interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children: (VNode | string | number)[];
  key?: string | number;
  el?: Element; // Reference to actual DOM element
}
```

### VNodeProps

```typescript
interface VNodeProps {
  [key: string]: any;
  key?: string | number;
  children?: (VNode | string | number)[];
}
```

## Functions

### createVNode

Creates a virtual DOM node.

```typescript
function createVNode(
  type: string | Function,
  props: VNodeProps = {},
  children: (VNode | string | number)[] = []
): VNode
```

**Parameters:**
- `type`: Element type (tag name or component function)
- `props`: Element properties and attributes
- `children`: Child nodes or text content

**Returns:** A new virtual DOM node

### createTextVNode

Creates a text virtual node.

```typescript
function createTextVNode(text: string | number): VNode
```

**Parameters:**
- `text`: Text content

**Returns:** A text virtual node

### isTextVNode

Checks if a virtual node represents text.

```typescript
function isTextVNode(vnode: VNode): boolean
```

### isSameVNodeType

Checks if two virtual nodes have the same type and key.

```typescript
function isSameVNodeType(oldVNode: VNode, newVNode: VNode): boolean
```

### createElement

JSX-like function for creating virtual DOM elements.

```typescript
function createElement(
  type: string | Function,
  props?: VNodeProps | null,
  ...children: (VNode | string | number | boolean)[]
): VNode
```

**Parameters:**
- `type`: Element type
- `props`: Element properties (optional)
- `children`: Child elements or text (filters out null/undefined/false)

**Returns:** A virtual DOM element

**Example:**
```typescript
const element = createElement('div', { className: 'container' },
  createElement('h1', {}, 'Title'),
  createElement('p', {}, 'Content')
);
```

### diff

Compares two virtual DOM trees and generates patches.

```typescript
function diff(oldVNode: VNode | null, newVNode: VNode | null): PatchResult
```

**Parameters:**
- `oldVNode`: Previous virtual DOM tree
- `newVNode`: New virtual DOM tree

**Returns:** Patch operations and new virtual node

### patch

Applies patches to the actual DOM.

```typescript
function patch(parent: Element | Document | DocumentFragment, patches: PatchOp[]): void
```

**Parameters:**
- `parent`: DOM parent element
- `patches`: Array of patch operations

## Patch Operations

### PatchOp

```typescript
type PatchOp =
  | { type: 'CREATE'; newVNode: VNode }
  | { type: 'UPDATE'; oldVNode: VNode; newVNode: VNode }
  | { type: 'DELETE'; oldVNode: VNode }
  | { type: 'REPLACE'; oldVNode: VNode; newVNode: VNode }
  | { type: 'MOVE'; vnode: VNode; fromIndex: number; toIndex: number };
```

### PatchResult

```typescript
interface PatchResult {
  patches: PatchOp[];
  newVNode?: VNode;
}
```

## Usage Examples

### Basic Virtual DOM Usage

```typescript
import { createElement, createTextVNode } from './vdom';

// Create elements
const vnode = createElement('div', { className: 'app' },
  createElement('h1', {}, createTextVNode('Hello World')),
  createElement('p', {}, 'This is a paragraph')
);

// Later, diff and patch
const patches = diff(oldVNode, newVNode);
patch(document.body, patches);
```

### Component Integration

```typescript
// In a component's view function
view: (state) => {
  return createElement('div', { className: 'counter' },
    createElement('span', {}, state.count.toString()),
    createElement('button', {
      onClick: () => ({ type: 'INCREMENT' })
    }, '+')
  );
}
```

## Performance Notes

- Virtual DOM diffing is O(n) where n is the number of nodes
- Only changed nodes trigger DOM updates
- Text nodes are handled efficiently
- Keys help optimize list reordering
