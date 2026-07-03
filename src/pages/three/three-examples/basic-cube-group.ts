import * as THREE from 'three';
import type { BasicSceneModuleFactory } from './types';

/**
 * 创建分组立方体
 *
 * Group:
 * - 可以理解为 Three.js 里的“容器对象”
 * - 多个 Mesh 可以放进同一个 Group
 * - 移动 / 旋转 / 缩放 Group 时，内部所有子对象都会一起变化
 *
 * 适合场景：
 * - 一个设备由多个零件组成
 * - 一个建筑由多个块组成
 * - 一个模型需要整体移动、整体旋转、整体缩放
 */
export const initBasicGroup: BasicSceneModuleFactory = (scene) => {
  /**
   * 创建分组对象
   *
   * 注意：
   * - Group 本身不会显示任何东西
   * - 它只是一个 Object3D 容器
   * - 真正显示的是添加到 group 里的 Mesh
   */
  const group = new THREE.Group();

  /**
   * 给 group 设置名称
   *
   * name:
   * - 方便调试
   * - 后续可以通过 scene.getObjectByName() 查找
   */
  group.name = 'basic-cube-group';

  /**
   * 创建共享几何体
   *
   * 这里 3 个 cube 都是一样的盒子形状，
   * 所以可以共用同一个 BoxGeometry。
   *
   * 好处：
   * - 减少几何体创建数量
   * - 释放时只需要 dispose 一次
   */
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

  /**
   * 创建材质
   *
   * 这里用不同颜色区分 3 个立方体。
   *
   * 注意：
   * - MeshBasicMaterial 不需要灯光
   * - 初学阶段更容易看到效果
   */
  const redMaterial = new THREE.MeshBasicMaterial({
    color: 0xff4d4f,
  });

  const greenMaterial = new THREE.MeshBasicMaterial({
    color: 0x52c41a,
  });

  const blueMaterial = new THREE.MeshBasicMaterial({
    color: 0x1677ff,
  });

  /**
   * 创建左侧立方体
   */
  const leftCube = new THREE.Mesh(geometry, redMaterial);
  leftCube.name = 'left-cube';
  leftCube.position.set(-0.8, 0, 0);

  /**
   * 创建中间立方体
   */
  const centerCube = new THREE.Mesh(geometry, greenMaterial);
  centerCube.name = 'center-cube';
  centerCube.position.set(0, 0, 0);

  /**
   * 创建右侧立方体
   */
  const rightCube = new THREE.Mesh(geometry, blueMaterial);
  rightCube.name = 'right-cube';
  rightCube.position.set(0.8, 0, 0);

  /**
   * 将多个 cube 添加到 group 中
   *
   * 注意：
   * - 这里只是添加到 group
   * - group 会在当前模块内部添加到 scene
   */
  group.add(leftCube);
  group.add(centerCube);
  group.add(rightCube);

  /**
   * 将 group 添加到场景中
   *
   * group 自己负责挂载到 scene，
   * BasicScene 只负责注册模块，不需要知道内部创建了哪些对象。
   */
  scene.add(group);

  /**
   * 调整整个 group 的位置
   *
   * 这里移动的是 group，
   * 所以内部 3 个 cube 会整体移动。
   */
  group.position.set(0, 0, 0);

  /**
   * 返回可销毁资源
   *
   * value:
   * - 当前 group 不需要逐帧动画，所以返回空模块
   *
   * dispose:
   * - 释放当前函数内部创建的所有资源
   */
  return {
    value: {},

    dispose() {
      /**
       * 从父级中移除 group
       *
       * removeFromParent():
       * - 不需要知道 group 当前挂在哪个 scene 或 parent 上
       * - 如果 group 已经被添加到 scene，会自动从 scene 中移除
       * - 如果 group 没有父级，也不会报错
       */
      group.removeFromParent();

      /**
       * 清空 group 子对象
       *
       * 注意：
       * - clear() 只是移除子对象引用
       * - 不会自动释放 geometry / material
       * - 所以下面仍然要手动 dispose
       */
      group.clear();

      /**
       * 释放共享几何体
       *
       * 因为 3 个 cube 共用同一个 geometry，
       * 所以这里只需要 dispose 一次。
       */
      geometry.dispose();

      /**
       * 释放材质资源
       *
       * 每个 cube 使用了不同 material，
       * 所以每个 material 都需要 dispose。
       */
      redMaterial.dispose();
      greenMaterial.dispose();
      blueMaterial.dispose();
    },
  };
};
