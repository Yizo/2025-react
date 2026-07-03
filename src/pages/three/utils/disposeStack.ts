import type { Disposable } from './types';

export type DisposeStack = {
  use: <T>(_resource: Disposable<T>) => T;
  defer: (_dispose: () => void) => void;
  dispose: () => void;
};

/**
 * 创建销毁函数栈
 *
 * 为什么要用栈？
 *
 * 初始化通常是顺序执行的，例如：
 * renderer -> scene -> camera -> controls -> objects -> loop
 *
 * 但销毁时必须反过来：
 * loop -> objects -> controls -> renderer
 *
 * 这样可以避免：
 * - 渲染循环还在跑，但对象已经被释放
 * - controls 还在监听事件，但 canvas 已经被移除
 * - renderer 已经 dispose，但后面还有代码继续 render
 */
export function createDisposeStack(): DisposeStack {
  const disposers: Array<() => void> = [];

  return {
    /**
     * 收集某个资源的销毁函数，并返回资源本身
     *
     * 用法：
     * const renderer = stack.use(initRenderer(size));
     */
    use<T>(resource: Disposable<T>) {
      disposers.push(resource.dispose);
      return resource.value;
    },

    /**
     * 手动注册一个销毁函数
     *
     * 当某个副作用不是通过 Disposable<T> 创建时，
     * 仍然可以把清理动作交给销毁栈统一管理。
     *
     * 典型场景：
     * - appendChild / removeChild
     * - scene.add / scene.remove
     * - 临时 style 修改恢复
     */
    defer(dispose: () => void) {
      disposers.push(dispose);
    },

    /**
     * 倒序执行所有销毁函数
     *
     * dispose 之后会清空数组，
     * 避免同一批销毁函数被重复调用。
     */
    dispose() {
      for (let i = disposers.length - 1; i >= 0; i--) {
        disposers[i]();
      }

      disposers.length = 0;
    },
  };
}
