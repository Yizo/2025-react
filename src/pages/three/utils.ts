import type { Disposable } from './types';

/**
 * 创建销毁函数栈
 *
 * 为什么要用栈？
 *
 * 初始化顺序通常是：
 * renderer -> scene -> camera -> controls -> objects -> loop
 *
 * 销毁顺序应该反过来：
 * loop -> objects -> controls -> renderer
 *
 * 这样可以避免：
 * - 渲染循环还在跑，但对象已经被释放
 * - controls 还监听 DOM，但 canvas 已经被移除
 * - renderer 已经销毁，但后续还在 render
 */
export function createDisposeStack() {
  const disposers: Array<() => void> = [];

  return {
    /**
     * 收集某个资源的销毁函数，并返回资源本身
     *
     * 用法：
     * const renderer = stack.use(initRenderer(root, size));
     */
    use<T>(resource: Disposable<T>) {
      disposers.push(resource.dispose);
      return resource.value;
    },

    /**
     * 倒序执行所有销毁函数
     */
    dispose() {
      for (let i = disposers.length - 1; i >= 0; i--) {
        disposers[i]();
      }

      disposers.length = 0;
    },
  };
}
