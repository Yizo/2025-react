import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getContainerSize, initStats, initResizeObserver } from '@/pages/three/utils';
import type { ContainerSize } from '@/pages/three/utils';

// 每行/每列的立方体数量
const COUNT = 5;
// 立方体边长
const CUBE_SIZE = 0.6;
// 立方体之间的间距
const GAP = 0.4;

function init(root: HTMLDivElement) {
  const size = getContainerSize(root);

  /**
   * 创建渲染器
   */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size.width, size.height, false);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  root.appendChild(renderer.domElement);

  /**
   * 创建场景
   */
  const scene = new THREE.Scene();

  /**
   * 创建相机
   */
  const camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
  camera.position.set(4, 4, 6);
  camera.lookAt(0, 0, 0);

  /**
   * 创建坐标轴辅助器
   */
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  /**
   * 创建轨道控制器
   */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  /**
   * 共享几何体和材质
   *
   * COUNT * COUNT 个立方体都用同一个 geometry / material，
   * 这样只需要创建和销毁一次。
   */
  const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
  const material = new THREE.MeshNormalMaterial();

  /**
   * 两层 for 循环生成阵列立方体
   *
   * 为什么需要 offset？
   * - 循环里 x、z 都从 0 开始，如果直接用 x*(size+gap) 当坐标，
   *   阵列会全部落在原点的正方向（右上角），整体偏离中心。
   * - offset 取「整个阵列跨度的一半」，让坐标从负到正对称分布，
   *   这样阵列的几何中心正好落在原点，方便相机对准和观察。
   * - (COUNT-1) 是因为 N 个立方体之间只有 N-1 段间隔。
   */
  const offset = ((COUNT - 1) * (CUBE_SIZE + GAP)) / 2;

  for (let x = 0; x < COUNT; x++) {
    for (let z = 0; z < COUNT; z++) {
      const cube = new THREE.Mesh(geometry, material);
      /**
       * 为什么这样算坐标？
       * - x*(CUBE_SIZE+GAP)：为什么乘间距，是要让相邻立方体错开固定距离，
       *   不重叠也不粘在一起。
       * - 减 offset：为什么减，是把「从 0 开始的坐标」整体左移半个跨度，
       *   使阵列围绕原点居中，而不是偏到一侧。
       * - y 恒为 0：为什么，是让所有立方体铺在同一水平面上，形成平铺网格。
       */
      cube.position.set(x * (CUBE_SIZE + GAP) - offset, 0, z * (CUBE_SIZE + GAP) - offset);
      scene.add(cube);
    }
  }

  /**
   * 性能监控面板
   */
  const stats = initStats();
  root.appendChild(stats.dom);

  /**
   * 渲染循环
   */
  const render = () => {
    stats.begin();
    controls.update();
    renderer.render(scene, camera);
    stats.end();
  };
  renderer.setAnimationLoop(render);

  function resize(nextSize: ContainerSize) {
    camera.aspect = nextSize.width / nextSize.height;
    camera.updateProjectionMatrix();
    renderer.setSize(nextSize.width, nextSize.height, false);
  }

  function dispose() {
    renderer.setAnimationLoop(null);
    controls.dispose();

    geometry.dispose();
    material.dispose();

    scene.remove(axesHelper);
    axesHelper.geometry.dispose();
    if (Array.isArray(axesHelper.material)) {
      axesHelper.material.forEach((item) => item.dispose());
    } else {
      axesHelper.material.dispose();
    }

    stats.dom.remove();
    renderer.domElement.remove();
    renderer.dispose();
  }

  return {
    dispose,
    resize,
  };
}

export default function CubeArrayCameraFit() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const runtime = init(el);
    const resizeObserver = initResizeObserver(el, { onResize: runtime.resize });

    return () => {
      resizeObserver.dispose();
      runtime.dispose();
    };
  }, []);

  return <div ref={rootRef} className="w-full h-full flex flex-auto relative" />;
}
