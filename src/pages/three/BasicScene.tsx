import * as THREE from 'three';

function init(root: HTMLDivElement) {
  // 创建场景
  const scene = new THREE.Scene();
  /**
   *  透视相机: 模拟人眼视角
   * 参数1: 角度,视野垂直范围,越大视野越广
   * 参数2: 画布宽高比
   * 参数3: 近裁剪面,小于此距离的物体不会被渲染
   * 参数4: 远裁剪面,大于此距离的物体不会被渲染
   */
  const camera = new THREE.PerspectiveCamera(75, root.clientWidth / root.clientHeight, 0.1, 1000);
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(root.clientWidth, root.clientHeight);
  root.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 3;

  let raf = 0;
  const render = () => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  };
  render();

  const resize = () => {
    const w = root.clientWidth;
    const h = root.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', resize);

  return () => {
    window.removeEventListener('resize', resize);
    cancelAnimationFrame(raf);
    renderer.dispose();
    geometry.dispose();
    material.dispose();
    cube.removeFromParent();
    root.removeChild(renderer.domElement);
  };
}

export default function BasicScene() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return init(el);
  }, []);

  return <div ref={rootRef} className="w-full h-[520px] rounded-lg overflow-hidden bg-black/5" />;
}
