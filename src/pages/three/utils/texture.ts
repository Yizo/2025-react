import * as THREE from 'three';

type TextureOptions = {
  colorSpace?: THREE.ColorSpace;
};

/**
 * 加载普通纹理
 *
 * TextureLoader:
 * - 把图片资源加载成 Three.js 可用的纹理对象
 * - 后续可以赋值给 material.map / scene.background 等位置
 *
 * 参数1:
 * - 图片地址
 *
 * 参数2:
 * - colorSpace: 纹理色彩空间
 *
 * 注意：
 * - 颜色类贴图通常要设置 colorSpace
 * - 数据类贴图（如法线贴图）通常不需要改
 */
export async function loadTexture(url: string, options: TextureOptions = {}) {
  const texture = await new THREE.TextureLoader().loadAsync(url);

  if (options.colorSpace) {
    texture.colorSpace = options.colorSpace;
  }

  return texture;
}
