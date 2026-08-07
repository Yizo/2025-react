import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getContainerSize, initStats, initResizeObserver } from '@/pages/three/utils';
import type { ContainerSize } from '@/pages/three/utils';

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
  camera.position.set(3, 3, 5);
  camera.lookAt(0, 0, 0);

  /**
   * 创建坐标轴辅助器
   */
  const axesHelper = new THREE.AxesHelper(3);
  scene.add(axesHelper);

  /**
   * 创建轨道控制器
   */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  /**
   * 缓冲几何体：4 个顶点拼出 1 个矩形（2 个三角形）
   *
   *   3 ---- 2
   *   |    / |
   *   |  /   |
   *   0 ---- 1
   */
  const geometry = new THREE.BufferGeometry();

  // 顶点坐标：每 3 个数是一个点 (x, y, z)
  const vertices = new Float32Array([
    0,
    0,
    0, // 0
    2,
    0,
    0, // 1
    2,
    2,
    0, // 2
    0,
    2,
    0, // 3
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  // 索引：每 3 个顶点编号组成一个三角形
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();

  const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  // 把矩形中心挪到原点，方便观察
  mesh.position.set(-1, -1, 0);
  scene.add(mesh);

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

    scene.remove(mesh);
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

export default function CustomGeometry() {
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
