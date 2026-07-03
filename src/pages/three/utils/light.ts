import * as THREE from 'three';
import type { Vector3Tuple } from './types';

type LightBaseOptions = {
  color?: THREE.ColorRepresentation;
  intensity?: number;
};

export type AmbientLightOptions = LightBaseOptions;

export type DirectionalLightOptions = LightBaseOptions & {
  position?: Vector3Tuple;
};

export type PointLightOptions = LightBaseOptions & {
  distance?: number;
  decay?: number;
  position?: Vector3Tuple;
};

/**
 * 创建环境光
 *
 * AmbientLight:
 * - 会均匀照亮场景中的所有物体
 * - 没有方向
 *
 * 注意：
 * - 这里只创建光源
 * - 不负责 add 到 scene
 */
export function initAmbientLight(options: AmbientLightOptions = {}): THREE.AmbientLight {
  const { color = 0xffffff, intensity = 1 } = options;
  return new THREE.AmbientLight(color, intensity);
}

/**
 * 创建平行光
 *
 * DirectionalLight:
 * - 可以理解为从某个方向照过来的平行光
 * - 常用于主光源、太阳光
 *
 * 注意：
 * - 这里只创建光源并设置位置
 * - 不负责 add 到 scene
 */
export function initDirectionalLight(
  options: DirectionalLightOptions = {}
): THREE.DirectionalLight {
  const { color = 0xffffff, intensity = 1, position = [5, 5, 5] } = options;
  const light = new THREE.DirectionalLight(color, intensity);

  light.position.set(...position);

  return light;
}

/**
 * 创建点光源
 *
 * PointLight:
 * - 可以理解为从某个点向四周发光
 * - 常用于灯泡、路灯、发光体
 *
 * 注意：
 * - 这里只创建光源并设置位置
 * - 不负责 add 到 scene
 */
export function initPointLight(options: PointLightOptions = {}): THREE.PointLight {
  const {
    color = 0xffffff,
    intensity = 1,
    distance = 0,
    decay = 2,
    position = [0, 2, 2],
  } = options;
  const light = new THREE.PointLight(color, intensity, distance, decay);

  light.position.set(...position);

  return light;
}
