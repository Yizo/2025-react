import * as THREE from 'three';
import type Stats from 'three/addons/libs/stats.module.js';
import { initAxesHelper } from './axesHelper';
import type { DisposeStack } from './disposeStack';
import type { ContainerSize, RenderLoopFrame } from './types';
import type {
  ThreeRuntimeContext,
  ThreeRuntimeFrameParams,
  ThreeRuntimeResizeParams,
} from './runtime.types';

/**
 * 挂载 renderer canvas
 *
 * renderer 本身只负责创建 canvas，
 * 具体挂到哪个容器属于 runtime 组合层职责。
 */
export function mountRenderer(
  root: HTMLDivElement,
  renderer: THREE.WebGLRenderer,
  stack: DisposeStack
) {
  const canvas = renderer.domElement;

  /**
   * setSize(..., false) 只更新绘制缓冲区，不改 canvas 的 CSS 尺寸。
   * 若不把 canvas 铺满 root，高分屏下 bitmap 会大于容器，
   * overflow:hidden 裁切后，世界原点会偏到可见区域右下角。
   */
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  root.appendChild(canvas);
  stack.defer(() => {
    if (canvas.parentElement === root) {
      root.removeChild(canvas);
    }
  });
}

/**
 * 创建并挂载坐标轴辅助对象
 *
 * 这里由 runtime 决定是否启用 axesHelper，
 * 原子工具本身不关心 scene.add / remove。
 */
export function attachAxesHelper(
  scene: THREE.Scene,
  axesHelper: boolean | number,
  stack: DisposeStack
) {
  if (!axesHelper) {
    return undefined;
  }

  const instance = stack.use(initAxesHelper(typeof axesHelper === 'number' ? axesHelper : 5));
  scene.add(instance);
  stack.defer(() => {
    scene.remove(instance);
  });

  return instance;
}

/**
 * 挂载 stats 面板，并确保 root 能承载 absolute 定位
 */
export function mountStatsPanel(root: HTMLDivElement, stats: Stats, stack: DisposeStack) {
  const rootPosition = window.getComputedStyle(root).position;
  const rootInlinePosition = root.style.position;

  if (rootPosition === 'static') {
    root.style.position = 'relative';
    stack.defer(() => {
      root.style.position = rootInlinePosition;
    });
  }

  root.appendChild(stats.dom);
  stack.defer(() => {
    stats.dom.remove();
  });
}

/**
 * 构造 resize 生命周期参数
 *
 * 统一把 runtime 上下文和当前 size 合并，
 * 避免在多个地方手写同一份对象结构。
 */
export function createResizeParams(
  context: ThreeRuntimeContext,
  size: ContainerSize
): ThreeRuntimeResizeParams {
  return {
    ...context,
    size,
  };
}

/**
 * 构造 frame 生命周期参数
 *
 * 统一把 runtime 上下文和当前帧信息合并，
 * 避免 runtime.ts 里反复组装相同结构。
 */
export function createFrameParams(
  context: ThreeRuntimeContext,
  frame: RenderLoopFrame
): ThreeRuntimeFrameParams {
  return {
    ...context,
    ...frame,
  };
}

/**
 * 应用 runtime 默认的 resize 行为
 *
 * 这是底座能力，不属于业务层回调。
 */
export function applyRuntimeResize(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  size: ContainerSize
) {
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height, false);
}
