/**
 * Update Scheduler for Marabutan Framework
 * 批量更新调度器，避免连续dispatch导致的多次渲染
 * 
 * @remarks
 * 使用微任务（microtask）队列来批处理更新，确保：
 * - 同一事件循环中的多次dispatch只触发一次渲染
 * - 保持DOM更新的同步性（微任务在当前任务结束后立即执行）
 * - 比setTimeout(0)更快，比直接同步渲染更高效
 */

/**
 * 更新调度器类
 * 
 * @remarks
 * 采用单例模式，全局共享一个调度器实例
 * 使用Set去重，避免同一个回调被调度多次
 */
class UpdateScheduler {
  /**
   * 待执行的更新回调集合
   * 使用Set自动去重
   */
  private pendingUpdates = new Set<() => void>();

  /**
   * 是否已经调度了flush任务
   */
  private isScheduled = false;

  /**
   * 调度一个更新回调
   * 
   * @param callback - 更新回调函数
   * 
   * @remarks
   * - 如果已经存在相同的callback，不会重复添加（Set去重）
   * - 第一次调度时会安排一个微任务来执行flush
   * - 后续调度只会添加到pendingUpdates，不会创建新的微任务
   * 
   * @example
   * ```typescript
   * scheduler.schedule(() => component.render());
   * scheduler.schedule(() => component.render()); // 只会执行一次
   * ```
   */
  schedule(callback: () => void): void {
    this.pendingUpdates.add(callback);

    if (!this.isScheduled) {
      this.isScheduled = true;
      // 使用queueMicrotask确保在当前任务完成后立即执行
      queueMicrotask(() => this.flush());
    }
  }

  /**
   * 立即执行所有待处理的更新
   * 
   * @remarks
   * - 清空pendingUpdates
   * - 重置isScheduled标志
   * - 按添加顺序执行所有回调
   * - 如果回调执行时抛出错误，不会中断其他回调的执行
   * 
   * @internal
   */
  flush(): void {
    const updates = Array.from(this.pendingUpdates);
    this.pendingUpdates.clear();
    this.isScheduled = false;

    // 执行所有更新，并捕获错误
    updates.forEach(update => {
      try {
        update();
      } catch (error) {
        console.error('[Marabutan Scheduler] Error during update:', error);
        // 继续执行其他更新
      }
    });
  }

  /**
   * 手动触发flush（用于测试）
   * 
   * @remarks
   * 正常情况下不需要手动调用，微任务会自动执行
   * 主要用于单元测试中同步执行待处理的更新
   */
  flushSync(): void {
    if (this.isScheduled) {
      this.flush();
    }
  }

  /**
   * 清空所有待处理的更新（用于测试和清理）
   */
  clear(): void {
    this.pendingUpdates.clear();
    this.isScheduled = false;
  }

  /**
   * 获取待处理更新的数量（用于测试和调试）
   */
  getPendingCount(): number {
    return this.pendingUpdates.size;
  }
}

/**
 * 全局调度器实例
 * 
 * @example
 * ```typescript
 * import { scheduler } from './utils/scheduler';
 * 
 * // 在组件dispatch中使用
 * scheduler.schedule(() => instance.render());
 * 
 * // 在MVI中使用
 * scheduler.schedule(() => render());
 * ```
 */
export const scheduler = new UpdateScheduler();

/**
 * 批量执行函数（立即模式）
 * 
 * @param fn - 要执行的函数
 * 
 * @remarks
 * 执行fn期间的所有schedule调用会被批处理
 * fn执行完毕后立即flush所有待处理的更新
 * 
 * @example
 * ```typescript
 * batchUpdates(() => {
 *   dispatch({ type: 'ACTION_1' });
 *   dispatch({ type: 'ACTION_2' });
 *   dispatch({ type: 'ACTION_3' });
 *   // 只会渲染一次
 * });
 * ```
 */
export function batchUpdates(fn: () => void): void {
  fn();
  scheduler.flushSync();
}

