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

  /**
   * 创建坐标轴辅助器
   */
  const axesHelper = new THREE.AxesHelper(12);
  scene.add(axesHelper);

  /**
   * 创建轨道控制器
   */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);

  /**
   * 常见几何体
   *
   * 所有几何体的尺寸都控制在 2 左右，避免相互之间差距过大，
   * 否则大的会把小的整个包住。
   */
  const geometries = [
    // 长方体
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
    // 球体
    new THREE.SphereGeometry(1, 32, 16),
    // 圆柱
    new THREE.CylinderGeometry(1, 1, 2, 32),
    // 矩形平面
    new THREE.PlaneGeometry(2, 2),
    // 圆形平面
    new THREE.CircleGeometry(1, 32),
    // 圆锥
    new THREE.ConeGeometry(1, 2, 32),
    // 圆环
    new THREE.TorusGeometry(1, 0.4, 16, 64),
    // 环面纽结
    new THREE.TorusKnotGeometry(0.8, 0.25, 64, 16),
  ];

  /**
   * 平面类几何体只有正面，从背面看会消失，所以用 DoubleSide
   */
  const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });

  /**
   * 沿 X 轴一字排开
   *
   * offset 取整排跨度的一半，让这排几何体以原点为中心左右对称分布，
   * 相机对准原点就能一次看全。
   */
  const GAP = 3;
  const offset = ((geometries.length - 1) * GAP) / 2;

  const meshes = geometries.map((geometry, index) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = index * GAP - offset;
    scene.add(mesh);
    return mesh;
  });

  /**
   * 相机适配
   *
   * 这排几何体的横向跨度是固定的，但容器宽高比会变，
   * 所以按「水平方向的可视角度」反推相机需要退到多远，
   * 保证窄容器下也不会把两端裁掉。
   */
  const SPAN = (geometries.length - 1) * GAP + 3;

  function fitCamera(aspect: number) {
    const halfVerticalFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * aspect);
    // 1.1 是留白系数，避免几何体贴着画面边缘
    const distance = (SPAN / 2 / Math.tan(halfHorizontalFov)) * 1.1;

    camera.position.set(0, distance * 0.35, distance);
    camera.lookAt(controls.target);
  }

  fitCamera(camera.aspect);

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
    fitCamera(camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setSize(nextSize.width, nextSize.height, false);
  }

  function dispose() {
    renderer.setAnimationLoop(null);
    controls.dispose();

    meshes.forEach((mesh) => scene.remove(mesh));
    geometries.forEach((geometry) => geometry.dispose());
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

export default function CommonGeometries() {
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
