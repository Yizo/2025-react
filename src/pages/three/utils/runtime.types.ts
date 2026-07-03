import type * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type Stats from 'three/addons/libs/stats.module.js';
import type { PerspectiveCameraOptions } from './camera';
import type { OrbitControlsOptions } from './orbitControls';
import type { RendererOptions } from './render';
import type { StatsOptions } from './stats';
import type { ContainerSize, RenderLoopFrame } from './types';

/**
 * createThreeRuntime 的入参
 *
 * 参数设计原则：
 * - root 是必填
 * - 其余都是“初始化阶段的默认配置”
 * - 这些配置只影响 runtime 创建时的初始状态
 *
 * 也就是说：
 * - renderer / camera / controls / stats 决定“怎么创建”
 * - useFrame / useResize 决定“运行后做什么”
 *
 * 这样可以把“初始化配置”和“运行期行为”拆开，
 * 避免所有东西都堆到一个 options 里。
 */
export type CreateThreeRuntimeOptions = {
  /**
   * Three 画布最终挂载到哪个容器里
   *
   * runtime 会把：
   * - renderer.domElement
   * - stats.dom
   *
   * 都挂到这个 root 里面。
   */
  root: HTMLDivElement;

  /**
   * 渲染器初始化配置
   *
   * 例如：
   * - antialias
   * - maxPixelRatio
   */
  renderer?: RendererOptions;

  /**
   * 相机初始化配置
   *
   * 例如：
   * - fov
   * - near / far
   * - 初始 position
   */
  camera?: PerspectiveCameraOptions;

  /**
   * 轨道控制器初始化配置
   *
   * 例如：
   * - 初始 target
   * - 阻尼开关
   * - 阻尼系数
   */
  controls?: OrbitControlsOptions;

  /**
   * stats 面板初始化配置
   *
   * 只影响面板样式和默认显示项，
   * 不影响 runtime 的帧循环逻辑。
   */
  stats?: StatsOptions;

  /**
   * 是否在创建时自动加入坐标轴辅助对象
   *
   * - false: 不创建
   * - true: 创建，长度默认 5
   * - number: 创建，并使用这个长度
   */
  axesHelper?: boolean | number;
};

/**
 * runtime 的基础上下文
 *
 * 这是所有生命周期都会共享的一批核心对象：
 * - scene / camera / renderer
 * - controls / timer / stats
 * - root / axesHelper
 */
export type ThreeRuntimeContext = {
  root: HTMLDivElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  timer: THREE.Timer;
  stats: Stats;
  axesHelper?: THREE.AxesHelper;
};

/**
 * useResize 回调收到的上下文
 *
 * 这是“当前 runtime 的完整 resize 现场”。
 * 你拿到它之后，通常可以做两类事：
 * 1. 读取当前 size
 * 2. 在默认 resize 行为之外补充业务逻辑
 *
 * 注意：
 * - runtime 已经先帮你做过相机和 renderer 的尺寸同步
 * - 所以这里更适合写额外逻辑，而不是重复 setSize
 */
export type ThreeRuntimeResizeParams = ThreeRuntimeContext & {
  size: ContainerSize;
};

/**
 * useFrame 回调收到的上下文
 *
 * 这是“当前帧的完整运行现场”。
 *
 * 其中最常用的是：
 * - delta: 当前帧和上一帧的时间差
 * - elapsed: 累计运行时间
 * - scene / camera / renderer: 当前渲染三件套
 *
 * 注意：
 * - runtime 会在你的 handler 之后自动执行：
 *   controls.update()
 *   renderer.render(scene, camera)
 * - 所以你通常只需要关心“更新场景状态”
 * - 不需要每个页面都手写一遍基础渲染收尾
 */
export type ThreeRuntimeFrameParams = ThreeRuntimeContext & RenderLoopFrame;

export type ThreeRuntimeFrameHandler = (_params: ThreeRuntimeFrameParams) => void;

export type ThreeRuntimeResizeHandler = (_params: ThreeRuntimeResizeParams) => void;

export type UseResizeOptions = {
  /**
   * 注册时是否立即补发一次当前尺寸
   *
   * - true: 立刻调用一次 handler
   * - false: 等下一次尺寸变化再调用
   *
   * 默认策略由 runtime 决定：
   * - start 前注册：默认 false
   * - 运行中注册：默认 true
   */
  immediate?: boolean;
};

/**
 * createThreeRuntime 的返回值
 *
 * 可以把它理解成一个“小型运行时实例”。
 *
 * 它分成两部分：
 * 1. 资源访问：
 *    root / scene / camera / renderer / controls / timer / stats
 * 2. 生命周期控制：
 *    useFrame / useResize / deferDispose / start / stop / dispose
 *
 * 最常见的使用顺序：
 * 1. const runtime = createThreeRuntime(...)
 * 2. runtime.useFrame(...)
 * 3. runtime.useResize(...)
 * 4. runtime.deferDispose(...)
 * 5. runtime.start()
 * 6. 页面卸载时 runtime.dispose()
 */
export type ThreeRuntime = ThreeRuntimeContext & {
  resizeObserver: ResizeObserver;
  useFrame: (_handler: ThreeRuntimeFrameHandler) => () => void;
  useResize: (_handler: ThreeRuntimeResizeHandler, _options?: UseResizeOptions) => () => void;
  deferDispose: (_dispose: () => void) => void;
  start: () => ThreeRuntime;
  stop: () => void;
  dispose: () => void;
};

/**
 * 高阶函数的 setup 回调
 *
 * 这个回调运行在“初始化完成、start 之前”的阶段。
 *
 * 也就是说：
 * - scene / camera / renderer / controls / timer / stats 都已经可用
 * - 但逐帧循环还没有开始
 *
 * 很适合在这里做：
 * - 创建 mesh / light / helper
 * - scene.add(...)
 * - runtime.useFrame(...)
 * - runtime.useResize(...)
 * - runtime.deferDispose(...)
 */
export type ThreeRuntimeSetup = (_runtime: ThreeRuntime) => void;

/**
 * defineThreeRuntime 的返回值
 *
 * 它本身不是 runtime，
 * 而是一个“场景初始化函数”。
 *
 * 你可以把它理解成：
 * - 第一步：先定义这个场景在 runtime 上要挂什么逻辑
 * - 第二步：真正传入 root 和初始化配置，得到 runtime 实例
 */
export type ThreeRuntimeFactory = (_options: CreateThreeRuntimeOptions) => ThreeRuntime;
