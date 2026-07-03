import { useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd';
import * as THREE from 'three';
import { createDisposeStack } from './utils';
import {
  initRenderer,
  initScene,
  initCamera,
  initControls,
  initAxesHelper,
  initResizeObserver,
  initTimer,
  initStats,
  startRenderLoop,
  getContainerSize,
} from './basic-scene-factory';
import type { BasicSceneModule, Disposable, SceneFrameHandler } from './types';

type PointDemoType = 'random' | 'grid' | 'ring' | 'sphere';

type PointDemoFactory = (_scene: THREE.Scene) => Disposable<BasicSceneModule>;

const POINT_DEMO_TABS: { key: PointDemoType; label: string }[] = [
  { key: 'random', label: '随机点云' },
  { key: 'grid', label: '网格点阵' },
  { key: 'ring', label: '圆环点阵' },
  { key: 'sphere', label: '点状球体' },
];

/**
 * 随机点云
 *
 * 循环目标：生成 count 个随机分布的顶点坐标和颜色。
 */
function initRandomPoints(scene: THREE.Scene): Disposable<BasicSceneModule> {
  const count = 800;

  /**
   * 为什么数组长度是 count * 3？
   *
   * BufferGeometry 的 position 是「扁平数组」：
   * 每个点占 3 个连续槽位 → [x0, y0, z0, x1, y1, z1, ...]
   *
   * 所以 800 个点需要 800 * 3 = 2400 个数字。
   *
   * 为什么用 Float32Array？
   * - WebGL 顶点坐标是 32 位浮点数
   * - 比普通数组更省内存，GPU 上传也更直接
   */
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    /**
     * i3 = i * 3
     *
     * 第 i 个点的起始下标：
     * - positions[i3]     → x
     * - positions[i3 + 1] → y
     * - positions[i3 + 2] → z
     *
     * 不用 i * 3 直接写三次也可以，但 i3 让意图更清晰。
     */
    const i3 = i * 3;

    /**
     * (Math.random() - 0.5) * 4
     *
     * Math.random()       → [0, 1)
     * Math.random() - 0.5 → [-0.5, 0.5)  以原点为中心
     * 再 * 4              → [-2, 2)       控制散布范围
     *
     * 三个轴独立随机，得到一个立方体范围内的均匀随机点云。
     *
     * 注意：
     * - 这里不是“球体内均匀分布”
     * - 而是 x/y/z 都在 [-2, 2) 内独立随机
     * - 所以整体外形更接近一个随机填充的立方体
     */
    positions[i3] = (Math.random() - 0.5) * 4;
    positions[i3 + 1] = (Math.random() - 0.5) * 4;
    positions[i3 + 2] = (Math.random() - 0.5) * 4;

    /**
     * setHSL(色相, 饱和度, 亮度)
     *
     * 色相用随机值，让每个点颜色不同；
     * 饱和度和亮度固定，避免颜色过灰或过暗。
     *
     * 写入 colors 的方式与 position 相同，也是每点 3 个分量 r/g/b。
     */
    color.setHSL(Math.random(), 0.8, 0.6);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();

  /**
   * setAttribute('position', ..., 3)
   *
   * 最后一个参数 3 表示「每 3 个数字为一组」，即一个顶点的 xyz。
   * Three.js 据此知道怎么把扁平数组解析成顶点列表。
   */
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    value: {
      onFrame(delta: number) {
        /**
         * rotation += delta * 速度
         *
         * delta 是上一帧到当前帧的秒数（约 0.016 @ 60fps）。
         * 用 delta 乘速度，而不是每帧固定 +0.01，
         * 可以保证不同帧率下旋转快慢一致。
         */
        points.rotation.y += delta * 0.3;
        points.rotation.x += delta * 0.15;
      },
    },
    dispose() {
      points.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * 规则网格点阵
 *
 * 循环目标：在 XY 平面上生成 rows × cols 个等间距点。
 */
function initGridPoints(scene: THREE.Scene): Disposable<BasicSceneModule> {
  const rows = 12;
  const cols = 12;
  const spacing = 0.2;

  /**
   * 总点数 = 行数 × 列数
   *
   * 双重循环会遍历 rows * cols 次，
   * 所以数组长度同样是 count * 3。
   */
  const count = rows * cols;
  const positions = new Float32Array(count * 3);

  /**
   * 用 index 记录当前是第几个点
   *
   * 也可以写成 i3 = (row * cols + col) * 3 跳过 index，
   * 但 index++ 更直观：每处理一个点，序号 +1。
   */
  let index = 0;

  /**
   * 外层循环：行（Y 方向）
   * 内层循环：列（X 方向）
   *
   * 先 row 再 col，点的排列顺序是「从左到右、从下到上」。
   *
   * 注意：
   * - 这里说的是 Three.js 世界坐标
   * - Three.js 中 Y 轴向上
   * - 和浏览器屏幕坐标的 Y 轴向下不一样
   */
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i3 = index * 3;

      /**
       * col * spacing
       * - 第 0 列在 x=0，第 1 列在 x=0.2，以此类推
       *
       * - ((cols - 1) * spacing) / 2
       * - 减去网格总宽度的一半，让整片点阵以原点为中心
       *
       * 例：12 列、间距 0.2 → 总宽 2.2，偏移 1.1
       * 最左列 x = -1.1，最右列 x = +1.1
       *
       * Y 方向同理。Z 固定为 0，表示铺在 XY 平面上。
       */
      positions[i3] = col * spacing - ((cols - 1) * spacing) / 2;
      positions[i3 + 1] = row * spacing - ((rows - 1) * spacing) / 2;
      positions[i3 + 2] = 0;

      index++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x1677ff,
    size: 0.12,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    value: {},
    dispose() {
      points.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * 圆环点阵
 *
 * 循环目标：把 count 个点均匀分布在半径为 radius 的圆上。
 */
function initRingPoints(scene: THREE.Scene): Disposable<BasicSceneModule> {
  const count = 64;
  const radius = 1.2;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    /**
     * 极坐标 → 直角坐标
     *
     * angle = (i / count) * 2π
     * - i 从 0 到 count-1
     * - 均匀切成 count 份，每份弧度 2π/count
     * - 保证首尾相接，围成完整圆环
     *
     * x = cos(angle) * radius
     * z = sin(angle) * radius
     * y = 0
     *
     * 为什么用 XZ 平面而不是 XY？
     * - 在 Three.js 里，XZ 平面通常可以理解为“地面 / 水平面”
     * - y = 0 表示所有点都落在同一个水平高度上
     * - OrbitControls 旋转相机时，更容易理解圆环和地面坐标的关系
     *
     * 注意默认视角：
     * - 当前相机在 +Z 方向看向原点
     * - 从这个角度看 XZ 平面会比较“侧”，圆环会显得被压扁
     * - 拖动 OrbitControls 换角度后，可以看到它确实是水平面上的圆
     */
    const angle = (i / count) * Math.PI * 2;
    const i3 = i * 3;

    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(angle) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xff4d4f,
    size: 0.1,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    value: {
      onFrame(delta: number) {
        points.rotation.y += delta * 0.8;
      },
    },
    dispose() {
      points.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}

/**
 * 点状球体
 *
 * 这里没有手写循环，而是复用 SphereGeometry 已经算好的顶点。
 *
 * 原因：
 * - 球面点的参数方程涉及经纬度、三角函数，手写较繁琐
 * - SphereGeometry 内部已经按经线 × 纬线分段生成顶点
 * - 克隆 position 属性即可直接拿来当 Points 的顶点数据
 *
 * 注意：
 * - 这些点不是“球面面积均匀采样”
 * - 经纬线分段会让极点附近更密，也可能包含接缝 / 极点重复顶点
 * - 但它很适合教学：可以直观看到同一份顶点数据既能画 Mesh，也能画 Points
 *
 * 与 Mesh 的区别：
 * - Mesh + SphereGeometry → 渲染三角面，看到实体球
 * - Points + 同一组顶点   → 只渲染顶点，看到点状球壳
 */
function initSpherePoints(scene: THREE.Scene): Disposable<BasicSceneModule> {
  const source = new THREE.SphereGeometry(1.2, 32, 16);
  const geometry = new THREE.BufferGeometry();

  /**
   * clone() 深拷贝顶点属性
   *
   * 为什么这里选择 clone？
   * - source 是临时几何体，只用来帮我们生成球面的 position 数据
   * - geometry 是真正交给 Points 使用的几何体
   * - clone 后，geometry 拥有自己独立的 position attribute
   *
   * 这样做的好处：
   * - source.dispose() 后，教学上更符合“谁创建谁释放”的资源边界
   * - 后续如果修改 geometry 的顶点数据，不会影响 source
   * - 读代码时也更清楚：source 只是数据来源，不参与最终渲染
   */
  geometry.setAttribute('position', source.getAttribute('position').clone());
  source.dispose();

  const material = new THREE.PointsMaterial({
    color: 0x52c41a,
    size: 0.06,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    value: {
      onFrame(delta: number) {
        points.rotation.y += delta * 0.5;
      },
    },
    dispose() {
      points.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}

const pointDemoFactories: Record<PointDemoType, PointDemoFactory> = {
  random: initRandomPoints,
  grid: initGridPoints,
  ring: initRingPoints,
  sphere: initSpherePoints,
};

function init(root: HTMLDivElement, demoType: PointDemoType) {
  const stack = createDisposeStack();

  const size = getContainerSize(root);

  const renderer = stack.use(initRenderer(root, size));

  const scene = initScene();

  const camera = initCamera(size);

  const controls = stack.use(initControls(camera, renderer.domElement));

  const timer = stack.use(initTimer());

  const stats = stack.use(initStats(root));

  const frameHandlers: SceneFrameHandler[] = [];

  /**
   * 根据当前 tab 只初始化一种点状图形
   *
   * pointDemoFactories[demoType] 从映射表取出对应工厂函数，
   * 避免写 if/else 或 switch，新增图形时只需加一项。
   */
  const demo = stack.use(pointDemoFactories[demoType](scene));
  if (demo.onFrame) {
    frameHandlers.push(demo.onFrame);
  }

  stack.use(initAxesHelper(scene));

  stack.use(startRenderLoop({ renderer, scene, camera, controls, timer, stats, frameHandlers }));

  stack.use(initResizeObserver({ root, camera, renderer }));

  return () => {
    stack.dispose();
  };
}


export default function PointGeometry() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<PointDemoType>('random');

  /**
   * activeTab 变化时重新初始化 Three.js 场景
   *
   * 为什么不用「显示/隐藏」四个对象，而是销毁重建？
   *
   * 1. 每次 tab 只展示一种图形，没必要同时保留四套 WebGL 资源
   * 2. useEffect 的 cleanup（return init 返回的 dispose）会先执行，
   *    再创建新场景，避免 canvas / 事件监听 / GPU 资源泄漏
   * 3. 切换 tab 后相机视角、控制器状态也会重置，体验更干净
   */
  useEffect(() => {
    const el = rootRef.current;

    if (!el) return;

    return init(el, activeTab);
  }, [activeTab]);

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        items={POINT_DEMO_TABS}
        onChange={(key) => setActiveTab(key as PointDemoType)}
        className="mb-3"
      />
      <div
        ref={rootRef}
        className="relative w-full h-[520px] rounded-lg overflow-hidden bg-black/5"
      />
    </div>
  );
}
