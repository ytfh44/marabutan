import type { VNode, PatchOp, PatchResult } from './types';
import { isSameVNodeType, isTextVNode } from './vnode';
import { shallowEqual } from '../utils/comparison';

/**
 * Create a key-to-index map for efficient lookups
 */
function createKeyToIndexMap(
  children: (VNode | string | number)[],
  startIndex: number = 0,
  endIndex?: number
): Map<string | number, number> {
  const map = new Map<string | number, number>();
  const end = endIndex ?? children.length - 1;
  
  for (let i = startIndex; i <= end; i++) {
    const child = children[i];
    if (typeof child === 'object' && 'key' in child && child.key !== undefined) {
      map.set(child.key, i);
    }
  }
  
  return map;
}

/**
 * Diff two virtual DOM trees and generate patches
 */
export function diff(oldVNode: VNode | null, newVNode: VNode | null): PatchResult {
  const patches: PatchOp[] = [];

  if (oldVNode === null && newVNode !== null) {
    // Create new node
    patches.push({ type: 'CREATE', newVNode });
    return { patches, newVNode };
  }

  if (oldVNode !== null && newVNode === null) {
    // Delete old node
    patches.push({ type: 'DELETE', oldVNode });
    return { patches };
  }

  if (oldVNode === null && newVNode === null) {
    return { patches: [] };
  }

  // Both nodes exist, compare them
  if (oldVNode && newVNode && !isSameVNodeType(oldVNode, newVNode)) {
    // Replace node
    patches.push({ type: 'REPLACE', oldVNode, newVNode });
    return { patches, newVNode };
  }

  // Same type, update props and children
  let updatedVNode: VNode | null = null;
  if (oldVNode && newVNode) {
    updatedVNode = { ...newVNode };

    // Check if props changed (using shallow equality for better performance)
    if (!shallowEqual(oldVNode.props, newVNode.props)) {
      patches.push({ type: 'UPDATE', oldVNode, newVNode: updatedVNode });
    }
  }

  // Diff children
  const childPatches = oldVNode && newVNode
    ? diffChildren(oldVNode.children, newVNode.children, patches)
    : { patches: [] };

  return {
    patches: [...patches, ...childPatches.patches],
    newVNode: updatedVNode || undefined
  };
}

/**
 * Diff children arrays with key-based reconciliation
 * Uses a more efficient algorithm that minimizes DOM operations
 */
function diffChildren(
  oldChildren: (VNode | string | number)[],
  newChildren: (VNode | string | number)[],
  patches: PatchOp[]
): PatchResult {
  // Ensure children are arrays (defensive programming)
  if (!Array.isArray(oldChildren)) {
    oldChildren = oldChildren ? [oldChildren as any] : [];
  }
  if (!Array.isArray(newChildren)) {
    newChildren = newChildren ? [newChildren as any] : [];
  }
  
  const oldLength = oldChildren.length;
  const newLength = newChildren.length;
  
  // Fast path for empty arrays
  if (oldLength === 0 && newLength === 0) {
    return { patches: [] };
  }
  
  if (oldLength === 0) {
    // All new children need to be created
    const resultPatches: PatchOp[] = [];
    for (const child of newChildren) {
      if (typeof child === 'object' && 'type' in child) {
        resultPatches.push({ type: 'CREATE', newVNode: child });
      }
    }
    return { patches: resultPatches };
  }
  
  if (newLength === 0) {
    // All old children need to be deleted
    const resultPatches: PatchOp[] = [];
    for (const child of oldChildren) {
      if (typeof child === 'object' && 'type' in child) {
        resultPatches.push({ type: 'DELETE', oldVNode: child });
      }
    }
    return { patches: resultPatches };
  }

  const resultPatches: PatchOp[] = [];
  
  // Check if children have keys
  const hasKeys = oldChildren.some(
    child => typeof child === 'object' && 'key' in child && child.key !== undefined
  ) || newChildren.some(
    child => typeof child === 'object' && 'key' in child && child.key !== undefined
  );
  
  if (hasKeys) {
    // Use key-based diff algorithm
    return diffChildrenWithKeys(oldChildren, newChildren);
  }
  
  // Simple position-based diff for children without keys
  const maxLength = Math.max(oldLength, newLength);
  
  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (oldChild == null && newChild != null) {
      // Create new child
      if (typeof newChild === 'object' && 'type' in newChild) {
        resultPatches.push({ type: 'CREATE', newVNode: newChild });
      }
    } else if (oldChild != null && newChild == null) {
      // Delete old child
      if (typeof oldChild === 'object' && 'type' in oldChild) {
        resultPatches.push({ type: 'DELETE', oldVNode: oldChild });
      }
    } else if (oldChild != null && newChild != null) {
      // Both exist, diff them
      if (typeof oldChild === 'object' && 'type' in oldChild &&
          typeof newChild === 'object' && 'type' in newChild) {
        const childDiff = diff(oldChild, newChild);
        resultPatches.push(...childDiff.patches);
      }
    }
  }

  return { patches: resultPatches };
}

/**
 * Helper function to check if two VNodes have the same key
 */
function isSameKey(a: VNode | string | number | null | undefined, b: VNode | string | number | null | undefined): boolean {
  if (!a || !b) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (!('key' in a) || !('key' in b)) return false;
  return a.key !== undefined && a.key === b.key;
}

/**
 * Diff children with key-based reconciliation using double-ended comparison
 * This minimizes DOM operations by reusing nodes with the same key
 * 
 * @remarks
 * 使用双端diff算法优化性能：
 * 1. 头-头比较：处理列表前部相同的节点
 * 2. 尾-尾比较：处理列表后部相同的节点
 * 3. 头-尾比较：处理节点从头部移到尾部的情况
 * 4. 尾-头比较：处理节点从尾部移到头部的情况
 * 5. 其他情况：使用key map查找
 * 
 * 对于逆序列表（如[1,2,3,4] -> [4,3,2,1]），双端diff比简单遍历效率更高
 */
function diffChildrenWithKeys(
  oldChildren: (VNode | string | number)[],
  newChildren: (VNode | string | number)[]
): PatchResult {
  const resultPatches: PatchOp[] = [];
  
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  
  let oldStartVNode = oldChildren[0];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[0];
  let newEndVNode = newChildren[newEndIdx];
  
  // 用于快速查找的key map（延迟创建）
  let oldKeyToIndex: Map<string | number, number> | null = null;
  
  // 双端比较循环
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 跳过已处理的节点（在移动操作中可能被标记为null）
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIdx];
    } else if (!newStartVNode) {
      newStartVNode = newChildren[++newStartIdx];
    } else if (!newEndVNode) {
      newEndVNode = newChildren[--newEndIdx];
    }
    // 头-头比较
    else if (isSameKey(oldStartVNode, newStartVNode)) {
      // 相同key的节点，只需diff props和children
      if (typeof oldStartVNode === 'object' && 'type' in oldStartVNode &&
          typeof newStartVNode === 'object' && 'type' in newStartVNode) {
        const childDiff = diff(oldStartVNode, newStartVNode);
        resultPatches.push(...childDiff.patches);
      }
      oldStartVNode = oldChildren[++oldStartIdx];
      newStartVNode = newChildren[++newStartIdx];
    }
    // 尾-尾比较
    else if (isSameKey(oldEndVNode, newEndVNode)) {
      if (typeof oldEndVNode === 'object' && 'type' in oldEndVNode &&
          typeof newEndVNode === 'object' && 'type' in newEndVNode) {
        const childDiff = diff(oldEndVNode, newEndVNode);
        resultPatches.push(...childDiff.patches);
      }
      oldEndVNode = oldChildren[--oldEndIdx];
      newEndVNode = newChildren[--newEndIdx];
    }
    // 头-尾比较（oldStart移到了newEnd的位置）
    else if (isSameKey(oldStartVNode, newEndVNode)) {
      if (typeof oldStartVNode === 'object' && 'type' in oldStartVNode &&
          typeof newEndVNode === 'object' && 'type' in newEndVNode) {
        const childDiff = diff(oldStartVNode, newEndVNode);
        resultPatches.push(...childDiff.patches);
        // 需要移动节点
        resultPatches.push({
          type: 'MOVE',
          vnode: oldStartVNode,
          fromIndex: oldStartIdx,
          toIndex: newEndIdx
        });
      }
      oldStartVNode = oldChildren[++oldStartIdx];
      newEndVNode = newChildren[--newEndIdx];
    }
    // 尾-头比较（oldEnd移到了newStart的位置）
    else if (isSameKey(oldEndVNode, newStartVNode)) {
      if (typeof oldEndVNode === 'object' && 'type' in oldEndVNode &&
          typeof newStartVNode === 'object' && 'type' in newStartVNode) {
        const childDiff = diff(oldEndVNode, newStartVNode);
        resultPatches.push(...childDiff.patches);
        // 需要移动节点
        resultPatches.push({
          type: 'MOVE',
          vnode: oldEndVNode,
          fromIndex: oldEndIdx,
          toIndex: newStartIdx
        });
      }
      oldEndVNode = oldChildren[--oldEndIdx];
      newStartVNode = newChildren[++newStartIdx];
    }
    // 四种情况都不匹配，使用key map查找
    else {
      // 延迟创建key map
      if (!oldKeyToIndex) {
        oldKeyToIndex = createKeyToIndexMap(oldChildren, oldStartIdx, oldEndIdx);
      }
      
      // 在剩余的旧节点中查找与newStart匹配的节点
      if (typeof newStartVNode === 'object' && 'type' in newStartVNode && newStartVNode.key !== undefined) {
        const idxInOld = oldKeyToIndex.get(newStartVNode.key);
        
        if (idxInOld !== undefined) {
          // 找到了匹配的节点
          const vnodeToMove = oldChildren[idxInOld];
          if (typeof vnodeToMove === 'object' && 'type' in vnodeToMove) {
            const childDiff = diff(vnodeToMove, newStartVNode);
            resultPatches.push(...childDiff.patches);
            // 移动节点
            resultPatches.push({
              type: 'MOVE',
              vnode: vnodeToMove,
              fromIndex: idxInOld,
              toIndex: newStartIdx
            });
            // 标记为已处理
            oldChildren[idxInOld] = null as any;
          }
        } else {
          // 没找到，创建新节点
          resultPatches.push({ type: 'CREATE', newVNode: newStartVNode });
        }
      }
      
      newStartVNode = newChildren[++newStartIdx];
    }
  }
  
  // 处理剩余的新节点（需要创建）
  if (newStartIdx <= newEndIdx) {
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      const newChild = newChildren[i];
      if (typeof newChild === 'object' && 'type' in newChild) {
        resultPatches.push({ type: 'CREATE', newVNode: newChild });
      }
    }
  }
  
  // 处理剩余的旧节点（需要删除）
  if (oldStartIdx <= oldEndIdx) {
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      const oldChild = oldChildren[i];
      if (oldChild && typeof oldChild === 'object' && 'type' in oldChild) {
        resultPatches.push({ type: 'DELETE', oldVNode: oldChild });
      }
    }
  }
  
  return { patches: resultPatches };
}
