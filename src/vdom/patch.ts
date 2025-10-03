import type { VNode, PatchOp, Props } from './types';
import { Fragment, isFragment } from './createElement';
import { isTextVNode } from './vnode';

/**
 * Property value type - all possible values that can be used as element properties
 * 不变（invariant）- 属性值可以被读取和设置
 */
export type PropValue = string | number | boolean | object | Function | null | undefined;

/**
 * Apply patches to the DOM
 */
export function patch(parent: Element | Document | DocumentFragment, patches: PatchOp[]): void {
  patches.forEach(patch => {
    switch (patch.type) {
      case 'CREATE':
        applyCreate(parent, patch.newVNode);
        break;
      case 'UPDATE':
        applyUpdate(patch.oldVNode, patch.newVNode);
        break;
      case 'DELETE':
        applyDelete(patch.oldVNode);
        break;
      case 'REPLACE':
        applyReplace(parent, patch.oldVNode, patch.newVNode);
        break;
      case 'MOVE':
        applyMove(parent, patch.vnode, patch.fromIndex, patch.toIndex);
        break;
    }
  });
}

/**
 * Create a DOM element from a VNode
 */
function applyCreate(parent: Element | Document | DocumentFragment, vnode: VNode): Node {
  const el = createDOMElement(vnode);
  if (el instanceof Element) {
    vnode.el = el;
  }

  if (parent) {
    parent.appendChild(el);
  }

  return el;
}

/**
 * Update an existing DOM element with new props and children
 */
function applyUpdate(oldVNode: VNode, newVNode: VNode): void {
  const el = oldVNode.el;
  if (!el) {
    console.error('[Marabutan] VNode missing DOM element reference during update', oldVNode);
    return;
  }
  updateElement(el, oldVNode.props, newVNode.props);
  updateChildren(el, oldVNode.children, newVNode.children);
  newVNode.el = el;
}

/**
 * Remove a DOM element
 */
function applyDelete(vnode: VNode): void {
  const el = vnode.el;
  if (!el) {
    console.warn('[Marabutan] Attempting to delete VNode with no DOM element');
    return;
  }

  // Clean up component instance if exists (prevents memory leaks)
  if ((vnode as any).__componentInstance) {
    const instance = (vnode as any).__componentInstance;
    if (typeof instance.destroy === 'function') {
      try {
        instance.destroy();
      } catch (error) {
        console.error('[Marabutan] Error destroying component instance:', error);
      }
    }
    // Clear the reference
    delete (vnode as any).__componentInstance;
  }

  if (el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

/**
 * Replace an old element with a new one
 */
function applyReplace(parent: Element | Document | DocumentFragment, oldVNode: VNode, newVNode: VNode): void {
  const oldEl = oldVNode.el;
  if (!oldEl) {
    console.error('[Marabutan] Cannot replace VNode with no DOM element', oldVNode);
    // Fallback: create the new element and append it
    applyCreate(parent, newVNode);
    return;
  }

  const newEl = createDOMElement(newVNode);

  if (oldEl.parentNode) {
    oldEl.parentNode.replaceChild(newEl, oldEl);
  }

  if (newEl instanceof Element) {
    newVNode.el = newEl;
  }
}

/**
 * Move an element from one position to another
 */
function applyMove(parent: Element | Document | DocumentFragment, vnode: VNode, fromIndex: number, toIndex: number): void {
  const el = vnode.el;
  if (!el) {
    console.error('[Marabutan] Cannot move VNode with no DOM element', vnode);
    return;
  }

  const children = Array.from(parent.children);
  const targetIndex = toIndex < children.length ? toIndex : children.length - 1;

  if (fromIndex < targetIndex) {
    parent.insertBefore(el, children[targetIndex + 1] || null);
  } else {
    parent.insertBefore(el, children[targetIndex]);
  }
}

/**
 * Create a DOM element from a VNode
 * Note: This is an internal function for creating actual DOM elements,
 * not to be confused with the public createElement function in createElement.ts
 * which creates VNodes.
 */
function createDOMElement(vnode: VNode): Node {
  if (isTextVNode(vnode)) {
    return document.createTextNode(String(vnode.children[0])) as Node;
  }

  // Handle Fragment - create a document fragment instead of a real element
  if (isFragment(vnode)) {
    const fragment = document.createDocumentFragment();
    vnode.children.forEach(child => {
      if (typeof child === 'object' && 'type' in child) {
        const childEl = createDOMElement(child);
        fragment.appendChild(childEl);
        child.el = childEl as Element;
      } else if (typeof child === 'string' || typeof child === 'number') {
        const textNode = document.createTextNode(String(child));
        fragment.appendChild(textNode);
      }
    });
    return fragment;
  }

  const el = document.createElement(vnode.type as string);

  // Set props
  Object.entries(vnode.props).forEach(([key, value]) => {
    setProp(el, key, value as PropValue);
  });

  // Create children
  vnode.children.forEach(child => {
    if (typeof child === 'object' && 'type' in child) {
      const childEl = createDOMElement(child);
      el.appendChild(childEl);
      if (childEl instanceof Element) {
        child.el = childEl;
      }
    } else if (typeof child === 'string' || typeof child === 'number') {
      const textNode = document.createTextNode(String(child));
      el.appendChild(textNode);
    }
  });

  return el;
}

/**
 * Update element properties
 */
function updateElement(el: Element, oldProps: Props, newProps: Props): void {
  // Remove old props
  Object.keys(oldProps).forEach(key => {
    if (!(key in newProps)) {
      removeProp(el, key, oldProps[key] as PropValue);
    }
  });

  // Set new or updated props
  Object.entries(newProps).forEach(([key, value]) => {
    if (oldProps[key] !== value) {
      setProp(el, key, value as PropValue);
    }
  });
}

/**
 * Update children elements
 */
function updateChildren(parent: Element, oldChildren: (VNode | string | number)[], newChildren: (VNode | string | number)[]): void {
  const oldLength = oldChildren.length;
  const newLength = newChildren.length;
  const maxLength = Math.max(oldLength, newLength);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (oldChild == null && newChild != null) {
      // Add new child
      if (typeof newChild === 'object' && 'type' in newChild) {
        const childEl = createDOMElement(newChild);
        parent.appendChild(childEl);
        if (childEl instanceof Element) {
          newChild.el = childEl;
        }
      } else if (typeof newChild === 'string' || typeof newChild === 'number') {
        const textNode = document.createTextNode(String(newChild));
        parent.appendChild(textNode);
      }
    } else if (oldChild != null && newChild == null) {
      // Remove old child
      if (typeof oldChild === 'object' && 'el' in oldChild && oldChild.el) {
        parent.removeChild(oldChild.el);
      }
    } else if (oldChild != null && newChild != null) {
      // Update existing child
      if (typeof oldChild === 'object' && 'type' in oldChild &&
          typeof newChild === 'object' && 'type' in newChild) {
        // Both are VNodes, update recursively
        applyUpdate(oldChild, newChild);
      } else if (typeof oldChild === 'object' && 'el' in oldChild && oldChild.el && oldChild.el instanceof Element) {
        // Replace text content
        if (typeof newChild === 'string' || typeof newChild === 'number') {
          oldChild.el.textContent = String(newChild);
        }
      }
    }
  }
}

/**
 * Event listener tracking to prevent duplicate bindings
 */
const eventListeners = new WeakMap<Element, Map<string, EventListener>>();

/**
 * Set a property on an element
 */
function setProp(el: Element, key: string, value: PropValue): void {
  if (key === 'className') {
    el.className = String(value);
  } else if (key.startsWith('on') && typeof value === 'function') {
    const eventName = key.toLowerCase().substring(2);
    
    // Track event listeners to prevent duplicates
    let listeners = eventListeners.get(el);
    if (!listeners) {
      listeners = new Map();
      eventListeners.set(el, listeners);
    }
    
    // Remove old listener if exists
    const oldListener = listeners.get(eventName);
    if (oldListener) {
      el.removeEventListener(eventName, oldListener);
    }
    
    // Add new listener
    el.addEventListener(eventName, value as EventListener);
    listeners.set(eventName, value as EventListener);
  } else if (key === 'style' && typeof value === 'object' && value !== null) {
    Object.assign((el as HTMLElement).style, value);
  } else if (key === 'value' && el instanceof HTMLInputElement) {
    (el as HTMLInputElement).value = String(value);
  } else if (key === 'checked' && el instanceof HTMLInputElement) {
    (el as HTMLInputElement).checked = Boolean(value);
  } else if (key === 'innerHTML' || key === 'dangerouslySetInnerHTML') {
    // Handle innerHTML (use with caution!)
    if (key === 'dangerouslySetInnerHTML' && typeof value === 'object' && value !== null && '__html' in value) {
      (el as HTMLElement).innerHTML = String((value as { __html: unknown }).__html);
    } else if (key === 'innerHTML') {
      (el as HTMLElement).innerHTML = String(value);
    }
  } else if (value != null && value !== false) {
    // Set attribute for everything else (skip null, undefined, false)
    el.setAttribute(key, String(value));
  }
}

/**
 * Remove a property from an element
 */
function removeProp(el: Element, key: string, oldValue: PropValue): void {
  if (key === 'className') {
    el.className = '';
  } else if (key.startsWith('on') && typeof oldValue === 'function') {
    const eventName = key.toLowerCase().substring(2);
    el.removeEventListener(eventName, oldValue as EventListener);
    
    // Clean up from tracking map
    const listeners = eventListeners.get(el);
    if (listeners) {
      listeners.delete(eventName);
      if (listeners.size === 0) {
        eventListeners.delete(el);
      }
    }
  } else if (key === 'style' && typeof oldValue === 'object' && oldValue !== null) {
    // Only remove old style properties, don't clear entire cssText
    Object.keys(oldValue).forEach(styleKey => {
      (el as HTMLElement).style[styleKey as any] = '';
    });
  } else if (key === 'value' && el instanceof HTMLInputElement) {
    (el as HTMLInputElement).value = '';
  } else if (key === 'checked' && el instanceof HTMLInputElement) {
    (el as HTMLInputElement).checked = false;
  } else {
    el.removeAttribute(key);
  }
}
