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

type LineDemoType = 'polyline' | 'loop' | 'segments' | 'spiral' | 'sphere-segments';

type LineDemoFactory = (_scene: THREE.Scene) => Disposable<BasicSceneModule>;

const LINE_DEMO_TABS: { key: LineDemoType; label: string }[] = [
  { key: 'polyline', label: '折线' },
  { key: 'loop', label: '闭合线' },
  { key: 'segments', label: '线段组' },
  { key: 'spiral', label: '螺旋线' },
  { key: 'sphere-segments', label: '球体线段' },
];

/**
 * 根据立方体 8 个顶点和 12 条边，生成 LineSegments 所需的 position 数组
 *
 * LineSegments 的数据格式是「每 2 个顶点 = 1 条线段」：
 * [起点x,y,z, 终点x,y,z, 起点x,y,z, 终点x,y,z, ...]
 *
 * 为什么不手写 72 个数字？
 * - 立方体边是有规律的：8 个顶点 + 12 条边的连接关系
 * - 用「顶点表 + 边索引表」循环填充，改 size 时只改一个变量
 * - 逻辑与手写结果完全一致，但可读性和可维护性更好
 */
function buildBoxWireframePositions(size: number) {
  const s = size;

  /**
   * 立方体 8 个顶点（从底面逆时针，再到顶面）
   *
   * 索引 0~3：底面（y = -s）
   * 索引 4~7：顶面（y = +s）
   */
  const vertices: [number, number, number][] = [
    [-s, -s, -s],
    [s, -s, -s],
    [s, -s, s],
    [-s, -s, s],
    [-s, s, -s],
    [s, s, -s],
    [s, s, s],
    [-s, s, s],
  ];

  /**
   * 12 条边，每条边用两个顶点索引表示
   *
   * 前 4 条：底面边框
   * 中 4 条：顶面边框
   * 后 4 条：连接底面与顶面的竖边
   */
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  /**
   * 每条边占 2 个顶点 × 3 个分量 = 6 个数字
   * 12 条边 → 12 * 6 = 72
   */
  const positions = new Float32Array(edges.length * 6);

  let offset = 0;

  for (const [startIndex, endIndex] of edges) {
    const start = vertices[startIndex];
    const end = vertices[endIndex];

    positions[offset++] = start[0];
    positions[offset++] = start[1];
    positions[offset++] = start[2];
    positions[offset++] = end[0];
    positions[offset++] = end[1];
    positions[offset++] = end[2];
  }

  return positions;
}

function disposeLineObject(line: THREE.Line | THREE.LineLoop | THREE.LineSegments) {
  line.removeFromParent();
  line.geometry.dispose();

  const material = line.material;

  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
  } else {
    material.dispose();
  }
}

/**
 * 折线（THREE.Line）
 *
 * Line 会按顶点顺序依次连线：P0→P1→P2→…→Pn
 * 不会自动连回起点。
 */
function initPolyline(scene: THREE.Scene): Disposable<BasicSceneModule> {
  const count = 100;

  /**
   * 折线有 count 个顶点，每个顶点 3 个分量 → count * 3
   */
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    /**
     * t 在 [0, 4π] 间均匀取样
     *
     * i / (count - 1)：
     * - 把 i 映射到 [0, 1]
     * - 用 count - 1 而不是 count，保证首尾分别落在 0 和 1
     */
    const t = (i / (count - 1)) * Math.PI * 4;

    /**
     * x：从 -2 到 +2 水平铺开
     * y：sin(t) 形成波浪
     * z：固定 0，曲线落在 XY 平面
     */
    positions[i3] = (i / (count - 1)) * 4 - 2;
    positions[i3 + 1] = Math.sin(t) * 0.8;
    positions[i3 + 2] = 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({ color: 0x1677ff });

  const line = new THREE.Line(geometry, material);
  scene.add(line);

  return {
    value: {},
    dispose() {
      disposeLineObject(line);
    },
  };
}

/**
 * 闭合线（THREE.LineLoop）
 *
 * LineLoop 与 Line 相同，但会把最后一个顶点连回第一个顶点，形成闭环。
 */
function initLineLoop(scene: THREE.Scene): Disposable<BasicSceneModule> {
  const count = 64;
  const radius = 1.2;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    /**
     * angle = (i / count) * 2π
     *
     * 与点页面的圆环相同：
     * 把圆周均分为 count 份，每份弧度 2π/count
     */
    const angle = (i / count) * Math.PI * 2;
    const i3 = i * 3;

    /**
     * 极坐标转直角坐标，圆放在 XZ 平面（y = 0）
     *
     * LineLoop 会自动把最后一个点连回第一个点，形成闭合圆环
     */
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(angle) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({ color: 0xff4d4f });

  const line = new THREE.LineLoop(geometry, material);
  scene.add(line);

  return {
    value: {
      onFrame(delta: number) {
        /**
         * rotation += delta * 速度
         * 用 delta 保证不同帧率下旋转速度一致
         */
        line.rotation.y += delta * 0.6;
      },
    },
    dispose() {
      disposeLineObject(line);
    },
  };
}

/**
 * 线段组（THREE.LineSegments）
 *
 * LineSegments 每两个顶点组成一条独立线段，不会跨段连线。
 * 这里用 buildBoxWireframePositions 循环计算立方体 12 条边的顶点坐标。
 */
function initLineSegments(scene: THREE.Scene): Disposable<BasicSceneModule> {
  const size = 1.2;

  const positions = buildBoxWireframePositions(size);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({ color: 0x52c41a });

  const line = new THREE.LineSegments(geometry, material);
  scene.add(line);

  return {
    value: {
      onFrame(delta: number) {},
    },
    dispose() {
      disposeLineObject(line);
    },
  };
}

/**
 * 3D 螺旋线（THREE.Line）
 *
 * 参数方程：
 * x = cos(t) * r
 * y = 沿高度爬升
 * z = sin(t) * r
 */
function initSpiralLine(scene: THREE.Scene): Disposable<BasicSceneModule> {
  const count = 200;
  const positions = new Float32Array(count * 3);
  const turns = 3;
  const radius = 1;
  const height = 2.5;

  for (let i = 0; i < count; i++) {
    /**
     * t：螺旋绕 Y 轴转过的角度
     *
     * turns = 3 表示从上到下共转 3 圈
     * t 范围：[0, 6π]
     */
    const t = (i / (count - 1)) * Math.PI * 2 * turns;
    const i3 = i * 3;

    /**
     * x/z 用 cos/sin 画圆，y 线性上升
     *
     * y 用 (i / (count - 1)) * height - height / 2
     * 让螺旋以原点为中心，上下各延伸 height/2
     */
    positions[i3] = Math.cos(t) * radius;
    positions[i3 + 1] = (i / (count - 1)) * height - height / 2;
    positions[i3 + 2] = Math.sin(t) * radius;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({ color: 0xfaad14 });

  const line = new THREE.Line(geometry, material);
  scene.add(line);

  return {
    value: {
      onFrame(delta: number) {
        line.rotation.y += delta * 0.5;
      },
    },
    dispose() {
      disposeLineObject(line);
    },
  };
}

function initSphereSegments(scene: THREE.Scene): Disposable<BasicSceneModule> {
  // 创建球体几何体
  const geometry = new THREE.SphereGeometry(1, 32, 16);
  // 创建线段材质
  const material = new THREE.LineBasicMaterial({ color: 0x52c41a });
  // 创建线物体
  const line = new THREE.Line(geometry, material);
  // 添加到场景
  scene.add(line);
  // 返回模块
  return {
    value: {
      onFrame(delta: number) {
        line.rotation.y += delta * 0.5;
      },
    },
    dispose() {
      disposeLineObject(line);
    },
  };
}

const lineDemoFactories: Record<LineDemoType, LineDemoFactory> = {
  polyline: initPolyline,
  loop: initLineLoop,
  segments: initLineSegments,
  spiral: initSpiralLine,
  'sphere-segments': initSphereSegments,
};

function init(root: HTMLDivElement, demoType: LineDemoType) {
  const stack = createDisposeStack();

  const size = getContainerSize(root);

  const renderer = stack.use(initRenderer(root, size));

  const scene = initScene();

  const camera = initCamera(size);

  const controls = stack.use(initControls(camera, renderer.domElement));

  const timer = stack.use(initTimer());

  const stats = stack.use(initStats(root));

  const frameHandlers: SceneFrameHandler[] = [];

  const demo = stack.use(lineDemoFactories[demoType](scene));
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

export default function LineGeometry() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<LineDemoType>('polyline');

  useEffect(() => {
    const el = rootRef.current;

    if (!el) return;

    return init(el, activeTab);
  }, [activeTab]);

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        items={LINE_DEMO_TABS}
        onChange={(key) => setActiveTab(key as LineDemoType)}
        className="mb-3"
      />
      <div
        ref={rootRef}
        className="relative w-full h-[520px] rounded-lg overflow-hidden bg-black/5"
      />
    </div>
  );
}
