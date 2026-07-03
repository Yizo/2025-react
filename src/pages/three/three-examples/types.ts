import type * as THREE from 'three';

/**
 * 可销毁资源结构
 *
 * 每个原子初始化函数返回：
 * - value: 创建出来的资源
 * - dispose: 该资源自己的销毁逻辑
 *
 * 好处：
 * - 谁创建，谁销毁
 * - init() 不需要知道每个资源内部怎么释放
 * - 后续加灯光、模型、贴图、GUI、Raycaster 时结构不会乱
 */
export type Disposable<T> = {
  value: T;
  dispose: () => void;
};

/**
 * 场景模块的逐帧更新函数
 *
 * delta:
 * - 上一帧到当前帧的时间差，单位是秒
 * - 用它做动画可以避免不同帧率下速度不一致
 */
export type SceneFrameHandler = (delta: number) => void;

/**
 * 基础场景内容模块
 *
 * onFrame:
 * - 可选
 * - 只有需要动画的模块才提供
 */
export type BasicSceneModule = {
  onFrame?: SceneFrameHandler;
};

/**
 * 场景模块工厂
 *
 * 只传入 scene，保持最小依赖。
 * 模块内部自己负责 add / remove 自己创建的对象。
 */
export type BasicSceneModuleFactory = (scene: THREE.Scene) => Disposable<BasicSceneModule>;
