import { useEffect, useRef } from 'react';
import { createThreeRuntime } from '@/pages/three/utils';
import * as THREE from 'three';

/** 与容器默认高度对齐，用于 resize 时按比例调整相机距离 */
const REF_MIN_SIDE = 520;

function init(root: HTMLDivElement) {
  const runtime = createThreeRuntime({
    root,
  });

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();
  const box = new THREE.Mesh(geometry, material);

  runtime.scene.add(box);

  runtime.deferDispose(() => {
    runtime.scene.remove(box);
    geometry.dispose();
    material.dispose();
  });

  runtime.useResize(({ size, camera }) => {
    const minSide = Math.max(Math.min(size.width, size.height), 1);

    // 容器变小时拉近相机，保持 box 在画面中的视觉占比大致稳定
    camera.position.z = 3 * (REF_MIN_SIDE / minSide);
  });

  runtime.useFrame(({ delta, elapsed }) => {
    box.rotation.x += delta;
    box.rotation.y += delta * 0.5;
    box.position.y = Math.sin(elapsed * 2) * 0.15;
  });

  runtime.start();

  return runtime;
}

export default function BasicScene() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const runtime = init(el);
    return () => runtime.dispose();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-[520px] w-full overflow-hidden rounded-lg bg-black/5"
    />
  );
}
