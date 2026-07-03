import type { ContainerSize, Disposable } from './types';

type ResizeObserverOptions = {
  immediate?: boolean;
  onResize: (_size: ContainerSize) => void;
};

/**
 * 读取容器尺寸
 *
 * Three.js 最终会把内容渲染到 canvas 上。
 * canvas 的尺寸通常应该和外层容器 root 保持一致。
 */
export function getContainerSize(root: HTMLDivElement): ContainerSize {
  const width = root.clientWidth;
  const height = root.clientHeight;

  if (width === 0 || height === 0) {
    console.warn('Three 容器尺寸为 0，请检查 root 是否设置了宽高');
  }

  return { width, height };
}

/**
 * 监听容器尺寸变化
 *
 * 这里只负责：
 * 1. 观察 root 尺寸变化
 * 2. 读取最新 size
 * 3. 把 size 交给外部回调
 *
 * 参数1:
 * - 监听元素
 *
 * 参数2:
 * - immediate: 是否立即执行
 * - onResize: 回调函数
 */
export function initResizeObserver(
  root: HTMLDivElement,
  options: ResizeObserverOptions
): Disposable<ResizeObserver> {
  const { onResize, immediate = true } = options;

  const resize = () => {
    onResize(getContainerSize(root));
  };

  if (immediate) {
    resize();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);

  return {
    value: resizeObserver,
    dispose() {
      resizeObserver.disconnect();
    },
  };
}
