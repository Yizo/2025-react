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
import type { SceneFrameHandler } from './types';

function initCircleGeometry(scene: THREE.Scene) {
  const geometry = new THREE.CircleGeometry(1, 32);

  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  return {
    value: {
      onFrame(delta: number) {},
    },
    dispose() {
      // 从场景中移除 mesh
      mesh.removeFromParent();

      // 释放几何体和材质资源
      geometry.dispose();
      material.dispose();
    },
  };
}

// 创建平面几何
function initPlaneGeometry(scene: THREE.Scene) {
  const geometry = new THREE.PlaneGeometry(1, 1);

  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(2, 2, -2);

  scene.add(mesh);

  return {
    value: {
      onFrame(delta: number) {},
    },
    dispose() {
      // 从场景中移除 mesh
      mesh.removeFromParent();

      // 释放几何体和材质资源
      geometry.dispose();
      material.dispose();
    },
  };
}

// 创建球体
function initSphereGeometry(scene: THREE.Scene) {
  const geometry = new THREE.SphereGeometry(1, 32, 16);

  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(-2, 2, -2);

  scene.add(mesh);

  return {
    value: {
      onFrame(delta: number) {
        mesh.rotation.y += delta * 1;
        mesh.rotation.x += delta * 1;
      },
    },
    dispose() {
      // 从场景中移除 mesh
      mesh.removeFromParent();

      // 释放几何体和材质资源
      geometry.dispose();
      material.dispose();
    },
  };
}

function init(root: HTMLDivElement) {
  const stack = createDisposeStack();

  const size = getContainerSize(root);

  const renderer = stack.use(initRenderer(root, size));

  const scene = initScene();

  const camera = initCamera(size);

  const controls = stack.use(initControls(camera, renderer.domElement));

  const timer = stack.use(initTimer());

  const stats = stack.use(initStats(root));
  const frameHandlers: SceneFrameHandler[] = [];

  const circleGeometry = stack.use(initCircleGeometry(scene));
  if (circleGeometry.onFrame) {
    frameHandlers.push(circleGeometry.onFrame);
  }

  const planeGeometry = stack.use(initPlaneGeometry(scene));
  if (planeGeometry.onFrame) {
    frameHandlers.push(planeGeometry.onFrame);
  }

  const sphereGeometry = stack.use(initSphereGeometry(scene));
  if (sphereGeometry.onFrame) {
    frameHandlers.push(sphereGeometry.onFrame);
  }

  stack.use(initAxesHelper(scene));

  stack.use(startRenderLoop({ renderer, scene, camera, controls, timer, stats, frameHandlers }));

  stack.use(initResizeObserver({ root, camera, renderer }));

  return () => {
    stack.dispose();
  };
}

export default function BasicScene() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;

    if (!el) return;

    init(el);
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full h-[520px] rounded-lg overflow-hidden bg-black/5"
    />
  );
}
