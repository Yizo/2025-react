import * as THREE from 'three';
import type { BasicSceneModuleFactory } from './types';

/**
 * 创建基础立方体
 *
 * 这个模块只关心自己创建的对象：
 * - 创建 cube
 * - 添加到 scene
 * - 提供自己的逐帧动画
 * - 销毁自己的 geometry / material
 */
export const initBasicCube: BasicSceneModuleFactory = (scene) => {
  /**
   * 创建几何体
   *
   * BoxGeometry:
   * - 盒子几何体
   *
   * 参数：
   * - width: 1
   * - height: 1
   * - depth: 1
   */
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  /**
   * 创建材质
   *
   * MeshNormalMaterial:
   * - 根据法线方向显示颜色
   * - 不需要灯光也能看到效果
   * - 适合初学阶段观察 3D 物体表面方向
   */
  const material = new THREE.MeshNormalMaterial();

  /**
   * 创建网格对象
   *
   * Mesh = Geometry + Material
   *
   * Geometry:
   * - 决定形状
   *
   * Material:
   * - 决定表面显示效果
   */
  const cube = new THREE.Mesh(geometry, material);

  /**
   * 移动网格
   *
   * cube.position.x = 1:
   * - 表示把 cube 沿 X 轴正方向移动 1 个单位
   * - X 轴是红色轴
   * - 通常可以理解为向右移动
   */
  cube.position.x = 1;

  /**
   * 将网格添加到场景中
   *
   * 注意：
   * - 创建 Mesh 后，如果不 add 到 scene
   * - renderer 是不会渲染它的
   */
  scene.add(cube);

  return {
    value: {
      onFrame(delta) {
        /**
         * 更新 cube 旋转
         *
         * 注意：
         * - rotation.x 不是沿 X 轴移动
         * - 而是以 X 轴为转轴旋转
         * - 视觉上通常表现为上下翻滚
         */
        cube.rotation.x += delta * 1;

        /**
         * 如果需要绕 Y 轴旋转，打开这一行。
         *
         * rotation.y:
         * - 以 Y 轴为转轴旋转
         * - 视觉上通常表现为左右转身
         */
        // cube.rotation.y += delta * 1;
      },
    },

    /**
     * 销毁立方体资源
     */
    dispose() {
      /**
       * 从场景中移除 cube
       *
       * remove 只是从 scene 树中移除，
       * 不等于释放 GPU 资源。
       */
      scene.remove(cube);

      /**
       * 释放 cube 的几何体资源
       */
      geometry.dispose();

      /**
       * 释放 cube 的材质资源
       */
      material.dispose();
    },
  };
};
