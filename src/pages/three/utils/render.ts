import * as THREE from 'three';
import type { ContainerSize, Disposable, RenderLoopFrame } from './types';

export type RendererOptions = {
  parameters?: THREE.WebGLRendererParameters;
  maxPixelRatio?: number;
};

export type RenderLoopOptions = {
  renderer: THREE.WebGLRenderer;
  timer: THREE.Timer;
  onFrame: (_frame: RenderLoopFrame) => void;
};

/**
 * 创建渲染器
 *
 * WebGLRenderer:
 * - 负责把 scene + camera 的结果绘制到 canvas
 * - renderer.domElement 就是对应的 canvas 元素
 *
 * 参数1:
 * - 尺寸
 *
 * 参数2:
 * - 选项
 * - parameters: 渲染器参数
 * - maxPixelRatio: 最大像素比
 *
 * 注意：
 * - 这个工具只负责创建和初始化 renderer
 * - 不负责把 canvas 挂到页面
 * - 调用方自己决定 renderer.domElement 放到哪里
 */
export function initRenderer(
  size: ContainerSize,
  options: RendererOptions = {}
): Disposable<THREE.WebGLRenderer> {
  const { parameters = { antialias: true }, maxPixelRatio = 2 } = options;
  const renderer = new THREE.WebGLRenderer(parameters);

  /**
   * 设置设备像素比
   *
   * Math.min(..., 2):
   * - 限制最高像素比为 2
   * - 避免超高分屏下分辨率过大，拖慢性能
   */
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

  /**
   * 设置绘制尺寸
   *
   * 第三个参数设为 false：
   * - 只更新内部绘制缓冲区
   * - 不主动覆盖 canvas 的 style 宽高
   */
  renderer.setSize(size.width, size.height, false);

  return {
    value: renderer,

    /**
     * 销毁 renderer
     *
     * 注意：
     * - 这里只释放 WebGL / Three.js 资源
     * - 不处理 DOM 移除
     */
    dispose() {
      renderer.dispose();
    },
  };
}

/**
 * 启动渲染循环
 *
 * 这个工具只负责：
 * 1. 维护逐帧计时
 * 2. 把当前帧上下文交给外部 onFrame
 *
 * 它不直接关心：
 * - scene / camera
 * - controls
 * - stats
 * - 业务动画
 *
 * 这些都由更上层的 runtime 自己组合。
 */
export function startRenderLoop(options: RenderLoopOptions): Disposable<null> {
  const { renderer, timer, onFrame } = options;

  const render = (timestamp?: number) => {
    timer.update(timestamp);

    const delta = timer.getDelta();
    const elapsed = timer.getElapsed();

    onFrame({
      timestamp,
      delta,
      elapsed,
    });
  };

  renderer.setAnimationLoop(render);

  return {
    value: null,

    /**
     * 停止渲染循环
     */
    dispose() {
      renderer.setAnimationLoop(null);
    },
  };
}
