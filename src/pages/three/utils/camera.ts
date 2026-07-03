import * as THREE from 'three';
import type { ContainerSize, Vector3Tuple } from './types';

export type PerspectiveCameraOptions = {
  fov?: number;
  near?: number;
  far?: number;
  position?: Vector3Tuple;
  target?: Vector3Tuple;
};

/**
 * 创建透视相机
 *
 * PerspectiveCamera:
 * - 透视相机
 * - 模拟人眼视角
 *
 * 参数1 fov:
 * - 视野垂直角度
 * - 越大视野越广
 *
 * 参数2 aspect:
 * - 画布宽高比
 * - 通常是 width / height
 *
 * 参数3 near:
 * - 近裁剪面
 * - 小于该距离的物体不会被渲染
 *
 * 参数4 far:
 * - 远裁剪面
 * - 大于该距离的物体不会被渲染
 *
 * 注意：
 * - Camera 本身通常不需要 dispose
 */
export function initPerspectiveCamera(size: ContainerSize, options: PerspectiveCameraOptions = {}) {
  const { fov = 75, near = 0.1, far = 1000, position = [0, 0, 3], target } = options;

  const camera = new THREE.PerspectiveCamera(fov, size.width / size.height, near, far);

  camera.position.set(...position);

  if (target) {
    camera.lookAt(...target);
  }

  return camera;
}
