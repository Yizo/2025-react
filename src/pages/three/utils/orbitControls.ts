import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Disposable, Vector3Tuple } from './types';

export type OrbitControlsOptions = {
  target?: Vector3Tuple;
  enableDamping?: boolean;
  dampingFactor?: number;
};

/**
 * 创建轨道控制器
 *
 * OrbitControls:
 * - 用鼠标控制相机围绕目标旋转
 * - 常用于 3D 模型查看器
 *
 * 参数1:
 * - 被控制的 camera
 *
 * 参数2:
 * - 监听鼠标/触摸事件的 DOM 元素
 * - 一般使用 renderer.domElement
 *
 * 参数3:
 * - target: 控制器围绕哪个点旋转
 * - enableDamping: 是否开启阻尼
 * - dampingFactor: 阻尼系数
 */
export function initControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
  options: OrbitControlsOptions = {}
): Disposable<OrbitControls> {
  const { target = [0, 0, 0], enableDamping = true, dampingFactor = 0.05 } = options;
  const controls = new OrbitControls(camera, domElement);

  /**
   * 设置控制器观察目标
   *
   * 默认 target 就是原点。
   * 这里显式写出来，方便理解：
   * - 相机在 z = 3
   * - controls.target 在原点
   * - 所以相机围绕原点旋转
   */
  controls.target.set(...target);

  /**
   * 开启阻尼效果
   *
   * enableDamping:
   * - 让鼠标操作有惯性
   * - 视觉体验更顺滑
   *
   * 注意：
   * - 开启 enableDamping 后
   * - 必须在每一帧调用 controls.update()
   */
  controls.enableDamping = enableDamping;
  controls.dampingFactor = dampingFactor;

  /**
   * 手动更新一次控制器
   *
   * 当你设置了 camera.position 或 controls.target 后，
   * 调用 update 可以让控制器内部状态同步。
   */
  controls.update();

  return {
    value: controls,

    /**
     * 销毁控制器
     *
     * controls 内部绑定了鼠标、触摸等事件，
     * 页面销毁时必须释放。
     */
    dispose() {
      controls.dispose();
    },
  };
}
