import { useEffect, useRef } from 'react';
import type { BasicSceneModuleFactory, Disposable, SceneFrameHandler } from './types';
import {
  getContainerSize,
  initRenderer,
  initScene,
  initCamera,
  initControls,
  initAxesHelper,
  initResizeObserver,
  initTimer,
  initStats,
  startRenderLoop,
} from './basic-scene-factory';
import { initBasicCube } from './basic-cube';
import { initBasicGroup } from './basic-cube-group';

/**
 * 场景内容模块列表
 *
 * 新增物体时，只需要新增模块并放到这里。
 * basic-scene-factory 不需要知道具体物体是什么。
 */
const sceneModuleFactories: BasicSceneModuleFactory[] = [initBasicCube, initBasicGroup];

/**
 * 创建销毁函数栈
 *
 * 为什么要用栈？
 *
 * 初始化顺序通常是：
 * renderer -> scene -> camera -> controls -> objects -> loop
 *
 * 销毁顺序应该反过来：
 * loop -> objects -> controls -> renderer
 *
 * 这样可以避免：
 * - 渲染循环还在跑，但对象已经被释放
 * - controls 还监听 DOM，但 canvas 已经被移除
 * - renderer 已经销毁，但后续还在 render
 */
function createDisposeStack() {
  const disposers: Array<() => void> = [];

  return {
    /**
     * 收集某个资源的销毁函数，并返回资源本身
     *
     * 用法：
     * const renderer = stack.use(initRenderer(root, size));
     */
    use<T>(resource: Disposable<T>) {
      disposers.push(resource.dispose);
      return resource.value;
    },

    /**
     * 倒序执行所有销毁函数
     */
    dispose() {
      for (let i = disposers.length - 1; i >= 0; i--) {
        disposers[i]();
      }

      disposers.length = 0;
    },
  };
}

/**
 * 初始化基础 Three.js 场景
 *
 * 这里不直接手写每个资源的销毁细节。
 * 销毁细节由每个原子初始化函数自己提供。
 *
 * init 只负责：
 * 1. 按顺序初始化资源
 * 2. 收集 dispose
 * 3. 返回一个统一 cleanup
 */
function init(root: HTMLDivElement) {
  const stack = createDisposeStack();

  /**
   * 1. 读取容器尺寸
   */
  const size = getContainerSize(root);

  /**
   * 2. 创建渲染器
   */
  const renderer = stack.use(initRenderer(root, size));

  /**
   * 3. 创建场景
   */
  const scene = initScene();

  /**
   * 4. 创建相机
   */
  const camera = initCamera(size);

  /**
   * 5. 创建轨道控制器
   */
  const controls = stack.use(initControls(camera, renderer.domElement));

  /**
   * 6. 创建坐标轴辅助对象
   */
  stack.use(initAxesHelper(scene));

  /**
   * 7. 注册场景内容模块
   */
  const frameHandlers: SceneFrameHandler[] = [];

  for (const createModule of sceneModuleFactories) {
    const sceneModule = stack.use(createModule(scene));

    if (sceneModule.onFrame) {
      frameHandlers.push(sceneModule.onFrame);
    }
  }

  /**
   * 8. 监听容器尺寸变化
   */
  stack.use(
    initResizeObserver({
      root,
      camera,
      renderer,
    })
  );

  /**
   * 9. 创建计时器
   */
  const timer = stack.use(initTimer());

  /**
   * 10. 创建性能监控面板
   */
  const stats = stack.use(initStats(root));

  /**
   * 11. 启动渲染循环
   */
  stack.use(
    startRenderLoop({
      renderer,
      scene,
      camera,
      controls,
      timer,
      stats,
      frameHandlers,
    })
  );

  /**
   * 12. 返回统一销毁函数
   *
   * 注意：
   * - init 不关心每个资源怎么 dispose
   * - 每个原子函数自己负责销毁自己创建的资源
   * - 这里仅负责倒序执行 dispose
   */
  return () => {
    stack.dispose();
  };
}

export default function BasicScene() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;

    if (!el) return;

    return init(el);
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full h-[520px] rounded-lg overflow-hidden bg-black/5"
    />
  );
}
