import * as THREE from 'three';

/**
 * 创建场景
 *
 * Scene:
 * - 可以理解为 3D 世界的容器
 * - 物体、灯光、辅助线等都需要添加到 scene 中
 *
 * 注意：
 * - Scene 本身通常不需要 dispose
 * - 真正需要释放的是 scene 里面的 geometry / material / texture 等资源
 */
export function initScene() {
  return new THREE.Scene();
}
