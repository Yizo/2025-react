export type ContainerSize = {
  width: number;
  height: number;
};

/**
 * 三维坐标元组
 *
 * 用法：
 * - position
 * - target
 * - light.position
 */
export type Vector3Tuple = [x: number, y: number, z: number];

/**
 * Stats 面板索引
 *
 * - 0: FPS
 * - 1: MS
 * - 2: MB
 */
export type StatsPanel = 0 | 1 | 2;

/**
 * 绝对定位面板样式
 *
 * 目前主要给 stats 这类覆盖层 DOM 使用。
 */
export type OverlayPosition = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;
};

/**
 * 可销毁资源结构
 *
 * 每个原子工具返回：
 * - value: 创建出来的资源
 * - dispose: 这个资源自己的销毁逻辑
 */
export type Disposable<T> = {
  value: T;
  dispose: () => void;
};

/**
 * 渲染循环逐帧上下文
 *
 * timestamp:
 * - three.js animation loop 传入的时间戳
 *
 * delta:
 * - 上一帧到当前帧的时间差，单位是秒
 *
 * elapsed:
 * - 从计时器开始到当前帧的累计时间，单位是秒
 */
export type RenderLoopFrame = {
  timestamp?: number;
  delta: number;
  elapsed: number;
};
