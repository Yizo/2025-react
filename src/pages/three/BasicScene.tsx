import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

type ContainerSize = {
  width: number;
  height: number;
};

type BasicSceneResources = {
  root: HTMLDivElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  axesHelper: THREE.AxesHelper;
  geometry: THREE.BoxGeometry;
  material: THREE.MeshNormalMaterial;
  cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshNormalMaterial>;
  resizeObserver: ResizeObserver;
  timer: THREE.Timer;
  stats: Stats;
};

/**
 * 读取容器尺寸
 *
 * Three.js 最终会把内容渲染到 canvas 上。
 * canvas 的尺寸通常应该和外层容器 root 保持一致。
 */
function getContainerSize(root: HTMLDivElement): ContainerSize {
  const width = root.clientWidth;
  const height = root.clientHeight;

  if (width === 0 || height === 0) {
    console.warn('Three 容器尺寸为 0，请检查 root 是否设置了宽高');
  }

  return { width, height };
}

/**
 * 创建渲染器
 *
 * WebGLRenderer:
 * - 负责把 scene + camera 的结果渲染到 canvas
 * - renderer.domElement 就是最终插入页面的 canvas
 *
 * antialias:
 * - 开启抗锯齿
 * - 可以让边缘更平滑
 */
function initRenderer(root: HTMLDivElement, size: ContainerSize) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  /**
   * 设置设备像素比
   *
   * window.devicePixelRatio:
   * - 普通屏幕一般是 1
   * - Mac Retina / 手机屏幕可能是 2 或 3
   *
   * Math.min(..., 2):
   * - 限制最高像素比为 2
   * - 避免高分屏下渲染分辨率过大，导致性能下降
   */
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /**
   * 设置渲染尺寸
   *
   * 这里使用 root 的宽高，而不是 window.innerWidth / innerHeight。
   * 因为业务项目里 3D 区域不一定占满整个浏览器窗口。
   */
  renderer.setSize(size.width, size.height);

  /**
   * 将 renderer 创建出来的 canvas 添加到页面容器中
   */
  root.appendChild(renderer.domElement);

  return renderer;
}

/**
 * 创建场景
 *
 * Scene:
 * - 可以理解为 3D 世界的容器
 * - 物体、灯光、辅助线等都需要添加到 scene 中
 */
function initScene() {
  return new THREE.Scene();
}

/**
 * 创建透视相机
 *
 * PerspectiveCamera:
 * - 透视相机
 * - 模拟人眼视角
 *
 * 参数1 fov:
 * - 视野垂直角度
 * - 越大视野越广
 *
 * 参数2 aspect:
 * - 画布宽高比
 * - 通常是 width / height
 *
 * 参数3 near:
 * - 近裁剪面
 * - 小于该距离的物体不会被渲染
 *
 * 参数4 far:
 * - 远裁剪面
 * - 大于该距离的物体不会被渲染
 */
function initCamera(size: ContainerSize) {
  const camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 1000);

  /**
   * 设置相机位置
   *
   * Three.js 默认相机朝 -Z 方向看。
   *
   * cube 默认在原点：
   * cube.position = (0, 0, 0)
   *
   * camera.position.z = 3:
   * - 表示相机在 z = 3 的位置
   * - 朝 -Z 方向看
   * - 所以可以看到原点处的 cube
   *
   * 通俗理解：
   * - 相机往后退到 z = 3
   * - 看向原点
   */
  camera.position.set(0, 0, 3);

  return camera;
}

/**
 * 创建轨道控制器
 *
 * OrbitControls:
 * - 用鼠标控制相机围绕目标旋转
 * - 常用于 3D 模型查看器
 *
 * 参数1:
 * - 被控制的 camera
 *
 * 参数2:
 * - 监听鼠标/触摸事件的 DOM 元素
 * - 一般使用 renderer.domElement
 */
function initControls(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
  const controls = new OrbitControls(camera, domElement);

  /**
   * 设置控制器观察目标
   *
   * 默认 target 就是原点。
   * 这里显式写出来，方便理解：
   * - 相机在 z = 3
   * - controls.target 在原点
   * - 所以相机围绕原点旋转
   */
  controls.target.set(0, 0, 0);

  /**
   * 开启阻尼效果
   *
   * enableDamping:
   * - 让鼠标操作有惯性
   * - 视觉体验更顺滑
   *
   * 注意：
   * - 开启 enableDamping 后
   * - 必须在每一帧调用 controls.update()
   */
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  /**
   * 手动更新一次控制器
   *
   * 当你设置了 camera.position 或 controls.target 后，
   * 调用 update 可以让控制器内部状态同步。
   */
  controls.update();

  return controls;
}

/**
 * 创建坐标轴辅助对象
 *
 * AxesHelper:
 * - 红色轴：X 轴
 * - 绿色轴：Y 轴
 * - 蓝色轴：Z 轴
 *
 * 参数 5:
 * - 坐标轴长度
 */
function initAxesHelper(scene: THREE.Scene) {
  const axesHelper = new THREE.AxesHelper(5);

  /**
   * 将坐标轴辅助对象添加到场景中
   */
  scene.add(axesHelper);

  return axesHelper;
}

/**
 * 创建立方体
 *
 * 这里把 geometry、material、cube 一起返回。
 * 原因：
 * - cleanup 阶段需要释放 geometry
 * - cleanup 阶段需要释放 material
 * - cleanup 阶段需要从 scene 中移除 cube
 */
function initCube(scene: THREE.Scene) {
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
    geometry,
    material,
    cube,
  };
}

/**
 * 处理尺寸变化
 *
 * 为什么不用 window.resize？
 *
 * 因为业务项目里 root 尺寸变化不一定来自浏览器窗口变化。
 * 例如：
 * - 左侧菜单展开/收起
 * - Tab 切换
 * - 父容器布局变化
 * - 弹窗或面板改变布局
 *
 * ResizeObserver 更适合监听具体容器尺寸变化。
 */
function initResizeObserver(params: {
  root: HTMLDivElement;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}) {
  const { root, camera, renderer } = params;

  const resize = () => {
    const { width, height } = getContainerSize(root);

    /**
     * 更新相机宽高比
     *
     * 如果 canvas 尺寸变化了，
     * PerspectiveCamera 的 aspect 也必须同步更新。
     */
    camera.aspect = width / height;

    /**
     * 更新 renderer 渲染尺寸
     */
    renderer.setSize(width, height);

    /**
     * 更新相机投影矩阵
     *
     * 修改 camera.aspect / fov / near / far 后，
     * 必须调用 updateProjectionMatrix()。
     */
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);

  return resizeObserver;
}

/**
 * 创建计时器
 *
 * Timer:
 * - 用于计算每一帧之间的时间差 delta
 * - 用于获取累计运行时间 elapsed
 *
 * 为什么需要 delta？
 *
 * 如果直接写：
 * cube.rotation.x += 0.01
 *
 * 问题是：
 * - 高帧率设备每秒执行次数更多，动画会更快
 * - 低帧率设备每秒执行次数更少，动画会更慢
 *
 * 使用 delta 后：
 * - 动画速度和帧率解耦
 * - 不同设备上的动画速度更稳定
 */
function initTimer() {
  const timer = new THREE.Timer();

  /**
   * 连接 document
   *
   * connect(document):
   * - 不是必须调用
   * - 但官方建议可用于启用 Page Visibility API
   *
   * 好处：
   * - 当页面切到后台、浏览器标签页不可见时
   * - 可以避免恢复页面后出现很大的 delta
   *
   * 例如：
   * - 页面隐藏 10 秒后回来
   * - 如果 delta 突然变成 10 秒
   * - 物体动画可能会瞬间跳一大段
   */
  timer.connect(document);

  return timer;
}

/**
 * 创建性能监控面板
 *
 * Stats:
 * - 用于查看 FPS、每帧耗时、内存等调试信息
 * - 它不是 Three.js 场景对象
 * - 不需要添加到 scene
 * - 本质是一个 DOM 面板
 */
function initStats(parent?: HTMLElement) {
  const stats = new Stats();

  /**
   * showPanel(0):
   * - 0: FPS，每秒帧数
   * - 1: MS，每帧耗时
   * - 2: MB，内存占用，部分浏览器支持
   */
  stats.showPanel(0);

  /**
   * 设置 stats 面板位置
   *
   * 注意：
   * - stats.dom 是一个 DOM 元素，不是 Three.js 对象
   * - 这里把它放在右上角
   */
  stats.dom.style.position = 'absolute';
  stats.dom.style.top = '0px';
  stats.dom.style.left = 'auto';
  stats.dom.style.right = '0px';
  stats.dom.style.zIndex = '1000';

  /**
   * 将 stats 面板添加到指定容器
   *
   * 如果传入 parent：
   * - 添加到业务容器中
   *
   * 如果没有传入 parent：
   * - 默认添加到 document.body
   */
  if (parent) {
    /**
     * stats 使用 absolute 定位。
     * 如果 parent 是 static 定位，absolute 可能不会相对 parent 生效。
     * 所以这里确保 parent 至少是 relative。
     */
    const parentPosition = window.getComputedStyle(parent).position;

    if (parentPosition === 'static') {
      parent.style.position = 'relative';
    }

    parent.appendChild(stats.dom);
  } else {
    document.body.appendChild(stats.dom);
  }

  return stats;
}

/**
 * 启动渲染循环
 *
 * renderer.setAnimationLoop:
 * - 可以理解为 Three.js 封装后的 requestAnimationFrame
 * - 比手写 requestAnimationFrame 更适合后续兼容 WebXR
 *
 * 初学阶段也可以用 requestAnimationFrame，
 * 但这里推荐直接使用 setAnimationLoop。
 */
function startRenderLoop(params: {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  cube: THREE.Mesh;
  timer: THREE.Timer;
  stats: Stats;
}) {
  const { renderer, scene, camera, controls, cube, timer, stats } = params;

  /**
   * 渲染循环
   *
   * renderer.setAnimationLoop(render) 会把时间戳传给 render。
   *
   * 每一帧推荐顺序：
   *
   * 1. stats.begin()
   * 2. timer.update(timestamp)
   * 3. const delta = timer.getDelta()
   * 4. 更新物体状态
   * 5. controls.update()
   * 6. renderer.render(scene, camera)
   * 7. stats.end()
   *
   * 核心原则：
   * - 先更新计时器
   * - 再读取 delta
   * - 再更新对象状态
   * - 最后渲染画面
   */
  const render = (timestamp?: number) => {
    /**
     * 标记本帧统计开始
     *
     * begin/end 比单独 stats.update() 更适合包裹一整帧逻辑。
     * 这样统计的是本帧从开始到结束的完整耗时。
     */
    stats.begin();

    /**
     * 更新 Timer 内部状态
     *
     * 注意：
     * - Timer 和旧的 Clock 不一样
     * - Timer 需要先 update()
     * - 再 getDelta() / getElapsed()
     *
     * timestamp:
     * - 来自 requestAnimationFrame / setAnimationLoop
     * - 单位是毫秒
     */
    timer.update(timestamp);

    /**
     * 获取上一帧到当前帧的时间差
     *
     * 单位：
     * - 秒
     *
     * 例如：
     * - 60 FPS 时，delta 大约是 0.016
     * - 30 FPS 时，delta 大约是 0.033
     */
    const delta = timer.getDelta();

    /**
     * 更新 cube 旋转
     *
     * delta * 1:
     * - 表示每秒旋转约 1 弧度
     *
     * 注意：
     * - rotation.x 不是沿 X 轴移动
     * - 而是以 X 轴为转轴旋转
     * - 视觉上通常表现为上下翻滚
     *
     * 如果想转慢一点：
     * cube.rotation.x += delta * 0.5
     *
     * 如果想转快一点：
     * cube.rotation.x += delta * 2
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

    /**
     * 更新轨道控制器
     *
     * 如果开启了 enableDamping，
     * 必须每帧调用 controls.update()。
     *
     * 推荐放在 renderer.render 之前，
     * 因为 controls.update() 可能会更新 camera 状态。
     */
    controls.update();

    /**
     * 渲染场景
     *
     * renderer 会根据 camera 的视角，
     * 把 scene 中的内容绘制到 canvas 上。
     */
    renderer.render(scene, camera);

    /**
     * 标记本帧统计结束
     */
    stats.end();
  };

  renderer.setAnimationLoop(render);
}

/**
 * 销毁 Three.js 场景资源
 *
 * 业务项目中非常重要。
 *
 * 如果页面销毁时不清理：
 * - canvas 可能残留
 * - 鼠标事件可能重复绑定
 * - GPU 资源可能泄漏
 * - 路由反复进入后页面越来越卡
 */
function disposeBasicScene(resources: BasicSceneResources) {
  const {
    root,
    renderer,
    scene,
    controls,
    axesHelper,
    geometry,
    material,
    cube,
    resizeObserver,
    timer,
    stats,
  } = resources;

  /**
   * 停止监听容器尺寸变化
   */
  resizeObserver.disconnect();

  /**
   * 停止渲染循环
   */
  renderer.setAnimationLoop(null);

  /**
   * 释放 Timer 内部资源
   */
  timer.dispose();

  /**
   * 销毁控制器
   *
   * controls 内部绑定了鼠标、触摸等事件，
   * 页面销毁时必须释放。
   */
  controls.dispose();

  /**
   * 从场景中移除对象
   */
  scene.remove(cube);
  scene.remove(axesHelper);

  /**
   * 释放 cube 的几何体资源
   */
  geometry.dispose();

  /**
   * 释放 cube 的材质资源
   */
  material.dispose();

  /**
   * 释放坐标轴辅助对象内部资源
   *
   * AxesHelper 本身也是由 geometry + material 组成的对象。
   */
  axesHelper.geometry.dispose();

  if (Array.isArray(axesHelper.material)) {
    axesHelper.material.forEach((item) => item.dispose());
  } else {
    axesHelper.material.dispose();
  }

  /**
   * 释放 renderer 相关 WebGL 资源
   */
  renderer.dispose();

  /**
   * 移除性能监控面板
   *
   * Stats 本质是 DOM 面板，不是 Three.js 对象。
   * 页面销毁时需要手动从 DOM 中移除。
   */
  stats.dom.remove();

  /**
   * 从 DOM 中移除 canvas
   *
   * 加这个判断是为了避免：
   * - root 已经被销毁
   * - canvas 已经被其他逻辑移除
   * 导致 removeChild 报错
   */
  if (renderer.domElement.parentElement === root) {
    root.removeChild(renderer.domElement);
  }
}

/**
 * 初始化基础 Three.js 场景
 *
 * 这里负责把所有单一职责函数串起来。
 *
 * 推荐顺序：
 * 1. getSize        读取容器尺寸
 * 2. renderer       创建渲染器和 canvas
 * 3. scene          创建场景
 * 4. camera         创建相机并设置位置
 * 5. controls       创建控制器
 * 6. objects        创建辅助线、几何体、材质、网格
 * 7. resize         绑定尺寸变化
 * 8. timer          创建计时器
 * 9. stats          创建性能面板
 * 10. loop          启动渲染循环
 * 11. cleanup       销毁资源
 */
function init(root: HTMLDivElement) {
  const size = getContainerSize(root);

  const renderer = initRenderer(root, size);

  const scene = initScene();

  const camera = initCamera(size);

  const controls = initControls(camera, renderer.domElement);

  const axesHelper = initAxesHelper(scene);

  const { geometry, material, cube } = initCube(scene);

  const resizeObserver = initResizeObserver({
    root,
    camera,
    renderer,
  });

  const timer = initTimer();

  /**
   * 创建性能监控面板
   *
   * 这里传入 root：
   * - stats 面板会挂到当前 3D 容器内部
   * - 不会污染 document.body
   */
  const stats = initStats(root);

  startRenderLoop({
    renderer,
    scene,
    camera,
    controls,
    cube,
    timer,
    stats,
  });

  const resources: BasicSceneResources = {
    root,
    renderer,
    scene,
    camera,
    controls,
    axesHelper,
    geometry,
    material,
    cube,
    resizeObserver,
    timer,
    stats,
  };

  return () => {
    disposeBasicScene(resources);
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
