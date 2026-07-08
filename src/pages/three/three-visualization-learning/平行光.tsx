import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getContainerSize, initStats, initTimer, initResizeObserver } from '@/pages/three/utils';
import type { ContainerSize } from '@/pages/three/utils';

function init(root: HTMLDivElement) {
  const maxPixelRatio = 2;
  const size = getContainerSize(root);
  /**
   * 创建渲染器
   */
  const renderer = new THREE.WebGLRenderer({
    antialias: true, // 抗锯齿
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
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
  camera.position.z = 5;

  /**
   * 创建坐标轴辅助器
   */
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  /**
   * 创建轨道控制器
   */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 开启阻尼效果
  controls.dampingFactor = 0.25; // 阻尼因子

  /**
   * 创建几何体
   */
  const geometry = new THREE.BoxGeometry(2, 2, 2);

  /**
   * 创建材质
   *
   * MeshBasicMaterial / MeshNormalMaterial：不受光照影响，永远显示固定颜色
   * MeshLambertMaterial / MeshPhongMaterial / MeshStandardMaterial：会计算光照
   */
  const material = new THREE.MeshStandardMaterial({
    color: 0x1e90ff,
    metalness: 0.1,
    roughness: 0.6,
  });

  /**
   * 创建网格物体
   */
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  /**
   * 创建平行光
   */
  const directionalLight = new THREE.DirectionalLight(0xffffff, 30);
  directionalLight.position.set(2, 2, 3);
  directionalLight.target.position.copy(mesh.position); // 照向 mesh 中心
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  /**
   * 平行光辅助器
   */
  const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.25);
  scene.add(lightHelper);

  // 性能监控面板
  const stats = initStats();
  root.appendChild(stats.dom);
  // 计时器
  const timer = initTimer().value;

  /**
   * 创建渲染循环
   *
   * Timer 用法：每帧先 update(timestamp)，再 getDelta()。
   * 不调用 update 时，getDelta() 会一直返回 0。
   */
  const render = (timestamp?: number) => {
    timer.update(timestamp);
    // 获取时间差
    const delta = timer.getDelta();
    // console.log('delta', delta * 1000, 'ms');
    stats.begin();

    mesh.rotation.x += delta;
    mesh.rotation.y += delta;
    controls.update();
    renderer.render(scene, camera);
    stats.end();
  };

  /**
   * 启动渲染循环
   */
  renderer.setAnimationLoop(render);

  function dispose() {
    renderer.setAnimationLoop(null);
    controls.dispose();

    scene.remove(mesh);
    geometry.dispose();
    material.dispose();

    scene.remove(lightHelper);
    lightHelper.dispose();

    scene.remove(axesHelper);
    axesHelper.geometry.dispose();

    if (Array.isArray(axesHelper.material)) {
      axesHelper.material.forEach((item) => item.dispose());
    } else {
      axesHelper.material.dispose();
    }

    scene.remove(directionalLight);
    scene.remove(directionalLight.target);

    timer.dispose();
    stats.dom.remove();
    renderer.domElement.remove();
    renderer.dispose();
  }

  function resize(nextSize: ContainerSize) {
    camera.aspect = nextSize.width / nextSize.height;
    camera.updateProjectionMatrix();
    renderer.setSize(nextSize.width, nextSize.height, false);
  }

  return {
    dispose,
    resize,
  };
}

export default function DirectionalLight() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const runtime = init(el);
    const resizeObserver = initResizeObserver(el, { onResize: runtime.resize });

    return () => {
      runtime.dispose();
      resizeObserver.dispose();
    };
  }, []);

  return <div ref={rootRef} className="w-full h-full flex flex-auto relative"></div>;
}
