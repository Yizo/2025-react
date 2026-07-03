/**
 * Three runtime 使用示例
 *
 * ```ts
 * import { defineThreeRuntime } from '@/pages/three/utils';
 *
 * const initBasicScene = defineThreeRuntime((runtime) => {
 *   runtime.useFrame(({ delta }) => {
 *     console.log(delta);
 *   });
 * });
 *
 * function init(root: HTMLDivElement) {
 *   const runtime = initBasicScene({
 *     root,
 *     axesHelper: true,
 *   });
 *
 *   runtime.start();
 *
 *   return () => runtime.dispose();
 * }
 * ```
 */
import { initPerspectiveCamera } from './camera';
import { createDisposeStack } from './disposeStack';
import { getContainerSize, initResizeObserver } from './element';
import { initControls } from './orbitControls';
import { initRenderer, startRenderLoop } from './render';
import {
  applyRuntimeResize,
  attachAxesHelper,
  createFrameParams,
  createResizeParams,
  mountRenderer,
  mountStatsPanel,
} from './runtime.helpers';
import { initScene } from './scene';
import { initStats } from './stats';
import { initTimer } from './timer';
import type { Disposable } from './types';
import type {
  CreateThreeRuntimeOptions,
  ThreeRuntime,
  ThreeRuntimeContext,
  ThreeRuntimeFactory,
  ThreeRuntimeFrameHandler,
  ThreeRuntimeResizeHandler,
  ThreeRuntimeSetup,
  UseResizeOptions,
} from './runtime.types';

export type {
  CreateThreeRuntimeOptions,
  ThreeRuntime,
  ThreeRuntimeContext,
  ThreeRuntimeFactory,
  ThreeRuntimeFrameHandler,
  ThreeRuntimeFrameParams,
  ThreeRuntimeResizeHandler,
  ThreeRuntimeResizeParams,
  ThreeRuntimeSetup,
  UseResizeOptions,
} from './runtime.types';

/**
 * 创建一套最基础的 Three 运行时
 *
 * 角色定位：
 * - createThreeRuntime 只负责“初始化底座”
 * - defineThreeRuntime(setup) 负责“装配场景逻辑”
 *
 * 入参：
 * - options.root: 必填，Three 内容最终挂载的容器
 * - options.renderer / camera / controls / stats: 各原子工具的初始化配置
 * - options.axesHelper: 是否自动创建并挂载坐标轴辅助对象
 *
 * 返回：
 * - 返回一个 runtime 实例
 * - 实例创建后不会自动进入逐帧循环
 * - 需要调用 runtime.start() 才会进入运行态
 *
 * 内部顺序：
 * 1. 创建 scene / camera / renderer / controls / timer / stats
 * 2. 处理组合层副作用：
 *    appendChild、scene.add、style.position、销毁栈注册
 * 3. 暴露 useFrame / useResize / deferDispose
 * 4. start() 后：
 *    先做一次 resize 同步，再启动 render loop
 */
export function createThreeRuntime(options: CreateThreeRuntimeOptions): ThreeRuntime {
  const {
    root,
    renderer: rendererOptions,
    camera: cameraOptions,
    controls: controlsOptions,
    stats: statsOptions,
    axesHelper = true,
  } = options;
  const stack = createDisposeStack();
  const size = getContainerSize(root);
  const renderer = stack.use(initRenderer(size, rendererOptions));
  const scene = initScene();
  const camera = initPerspectiveCamera(size, cameraOptions);
  const controls = stack.use(initControls(camera, renderer.domElement, controlsOptions));
  const timer = stack.use(initTimer());
  const stats = initStats(statsOptions);
  const frameHandlers = new Set<ThreeRuntimeFrameHandler>();
  const resizeHandlers = new Set<ThreeRuntimeResizeHandler>();
  let loop: Disposable<null> | null = null;

  mountRenderer(root, renderer, stack);
  const axesHelperInstance = attachAxesHelper(scene, axesHelper, stack);
  mountStatsPanel(root, stats, stack);

  /**
   * runtime 共享上下文
   *
   * 这批对象会被：
   * - useFrame
   * - useResize
   * - build params
   *
   * 共同复用，避免重复组装相同字段。
   */
  const context: ThreeRuntimeContext = {
    root,
    renderer,
    scene,
    camera,
    controls,
    timer,
    stats,
    axesHelper: axesHelperInstance,
  };

  /**
   * 这里的 Set 可以理解为“订阅者列表”
   *
   * 好处：
   * - 可以注册多个 frame / resize handler
   * - 不需要在 create 参数里塞一大堆回调
   * - 可以随时取消注册，保持组合开放
   */
  const notifyResize = (nextSize: { width: number; height: number }) => {
    applyRuntimeResize(camera, renderer, nextSize);

    const params = createResizeParams(context, nextSize);

    resizeHandlers.forEach((handler) => {
      handler(params);
    });
  };

  const resizeObserver = stack.use(
    initResizeObserver(root, {
      /**
       * 创建 runtime 时先只建立观察，
       * 由 runtime.start() 统一触发第一次初始同步。
       */
      immediate: false,
      onResize(nextSize) {
        notifyResize(nextSize);
      },
    })
  );

  const useFrame = (handler: ThreeRuntimeFrameHandler) => {
    frameHandlers.add(handler);

    return () => {
      frameHandlers.delete(handler);
    };
  };

  const useResize = (handler: ThreeRuntimeResizeHandler, options: UseResizeOptions = {}) => {
    resizeHandlers.add(handler);

    /**
     * 默认策略：
     * - start 前注册，不立即触发
     * - 运行中注册，默认立刻补一次当前尺寸
     */
    const shouldRunImmediate = options.immediate ?? loop !== null;

    if (shouldRunImmediate) {
      const nextSize = getContainerSize(root);

      applyRuntimeResize(camera, renderer, nextSize);
      handler(createResizeParams(context, nextSize));
    }

    return () => {
      resizeHandlers.delete(handler);
    };
  };

  const runtime: ThreeRuntime = {
    ...context,
    resizeObserver,
    useFrame,
    useResize,
    deferDispose(dispose) {
      stack.defer(dispose);
    },

    /**
     * 启动 runtime
     *
     * 顺序：
     * 1. 先分发一次初始 resize
     * 2. 再启动统一渲染循环
     *
     * 这样可以保证第一帧开始前：
     * - camera.aspect 已经正确
     * - renderer 尺寸已经同步
     * - useResize 注册逻辑已经跑过一次
     */
    start() {
      if (loop) {
        return runtime;
      }

      notifyResize(getContainerSize(root));

      loop = startRenderLoop({
        renderer,
        timer,
        onFrame(frame) {
          /**
           * stats.begin()/end() 包住整帧，
           * 这样统计结果才包含：
           * - 外部 frameHandlers 的执行时间
           * - controls.update()
           * - renderer.render()
           */
          stats.begin();

          const params = createFrameParams(context, frame);

          /**
           * 先让业务层更新场景状态
           */
          frameHandlers.forEach((handler) => {
            handler(params);
          });

          /**
           * 再执行 runtime 默认收尾：
           * - 更新 controls
           * - 渲染 scene
           */
          controls.update();
          renderer.render(scene, camera);

          stats.end();
        },
      });

      return runtime;
    },

    /**
     * 停止逐帧循环
     *
     * stop 只暂停动画，
     * 不销毁 renderer / scene / observer。
     */
    stop() {
      if (!loop) {
        return;
      }

      loop.dispose();
      loop = null;
    },

    /**
     * 销毁整个 runtime
     *
     * 顺序：
     * 1. 先 stop，确保不再产生新帧
     * 2. 再执行销毁栈，释放 DOM / observer / controls / renderer 等资源
     * 3. 最后清空所有 handler 集合
     */
    dispose() {
      runtime.stop();
      stack.dispose();
      frameHandlers.clear();
      resizeHandlers.clear();
    },
  };

  return runtime;
}

/**
 * 定义一个场景专用的 runtime 初始化函数
 *
 * 这是一个高阶函数。
 *
 * 它做的事情是：
 * 1. 先接收 setup，定义“这个场景在 runtime 上要挂哪些逻辑”
 * 2. 再返回一个真正的 init 函数
 * 3. init 函数收到 options 后，才创建 runtime 实例
 *
 * 这样就把两件事拆开了：
 * - 初始化底座：createThreeRuntime(options)
 * - 装配场景：setup(runtime)
 */
export function defineThreeRuntime(setup: ThreeRuntimeSetup): ThreeRuntimeFactory {
  return (options) => {
    const runtime = createThreeRuntime(options);

    setup(runtime);

    return runtime;
  };
}

/**
 * 创建并立即启动 runtime
 *
 * 它等价于：
 * 1. createThreeRuntime(options)
 * 2. runtime.start()
 */
export function initThreeRuntime(options: CreateThreeRuntimeOptions): ThreeRuntime {
  return createThreeRuntime(options).start();
}
