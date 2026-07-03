import * as THREE from 'three';
import type { Disposable } from './types';

/**
 * 创建坐标轴辅助对象
 *
 * AxesHelper:
 * - 红色轴：X 轴
 * - 绿色轴：Y 轴
 * - 蓝色轴：Z 轴
 *
 * 参数1:
 * - 坐标轴长度
 *
 * 注意：
 * - 这里只创建 helper
 * - 不负责把它 add 到 scene
 */
export function initAxesHelper(length: number = 5): Disposable<THREE.AxesHelper> {
  const axesHelper = new THREE.AxesHelper(length);

  return {
    value: axesHelper,

    /**
     * 释放 helper 自己的资源
     *
     * 如果它已经被 add 到 scene，
     * 调用方应该先 remove，再 dispose。
     */
    dispose() {
      axesHelper.geometry.dispose();

      if (Array.isArray(axesHelper.material)) {
        axesHelper.material.forEach((item) => item.dispose());
      } else {
        axesHelper.material.dispose();
      }
    },
  };
}
