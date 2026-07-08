import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getContainerSize, initStats } from '@/pages/three/utils';

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
  controls.enableZoom = true; // 开启缩放
  controls.enablePan = true; // 开启平移
  controls.enableRotate = true; // 开启旋转

  /**
   * 创建性能监控面板
   */
  const stats = initStats();
  root.appendChild(stats.dom);

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
   * 创建点光源
   */
  const pointLight = new THREE.PointLight(0xffffff, 30, 100);
  pointLight.position.set(3, 3, 4);
  scene.add(pointLight);

  /**
   * 微弱环境光(没有方向)，避免背光面完全漆黑
   */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  /**
   * 创建光源辅助器
   */
  const lightHelper = new THREE.PointLightHelper(pointLight, 0.2);
  scene.add(lightHelper);

  /**
   * 创建渲染循环
   */
  const render = () => {
    stats.begin();
    controls.update();
    renderer.render(scene, camera);
    stats.end();
  };

  /**
   * 启动渲染循环
   */
  renderer.setAnimationLoop(render);

  function dispose() {}

  return {
    dispose,
  };
}

export default function PointLight() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const runtime = init(el);
    return () => runtime.dispose();
  }, []);

  return <div ref={rootRef} className="w-full h-full flex flex-auto"></div>;
}
