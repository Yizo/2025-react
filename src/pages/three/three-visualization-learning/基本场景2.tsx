import * as THREE from 'three';
import { getContainerSize } from '@/pages/three/utils/element';

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
   * 创建几何体
   */
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  /**
   * 创建材质
   */
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  /**
   * 创建网格
   */
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  /**
   * 创建渲染循环
   */
  const render = () => {
    renderer.render(scene, camera);
  };

  /**
   * 启动渲染循环
   */
  render();

  function dispose() {}

  return {
    dispose,
  };
}

export default function BasicScene2() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const runtime = init(el);
    return () => runtime.dispose();
  }, []);

  return <div ref={rootRef} className="w-full h-full flex flex-auto"></div>;
}
