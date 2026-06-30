import { useEffect, useRef, useState } from 'react';
import { Spin, Tabs } from 'antd';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createDisposeStack } from './utils';
import {
  getContainerSize,
  initRenderer,
  initScene,
  initCamera,
  initControls,
  initAxesHelper,
  initResizeObserver,
  initTimer,
  initStats,
  startRenderLoop,
  type ContainerSize,
} from './basic-scene-factory';
import type { BasicSceneModule, Disposable, SceneFrameHandler } from './types';

type PanoramaDemoType = 'globe' | 'panorama' | 'cube';

type ImageModule = () => Promise<{ default: string }>;

type PanoramaDemoFactory = (
  _scene: THREE.Scene,
  _loadImage: ImageModule
) => Promise<Disposable<BasicSceneModule>>;

const PANORAMA_DEMO_TABS: { key: PanoramaDemoType; label: string }[] = [
  { key: 'globe', label: '地球（相机在外）' },
  { key: 'panorama', label: '全景（相机在内）' },
  { key: 'cube', label: '六面立方体' },
];

/** 外部观察的地球半径 */
const GLOBE_RADIUS = 1;

/** 内部环顾的全景球半径，需远大于相机 near/far 范围 */
const PANORAMA_SPHERE_RADIUS = 500;

/** 六面立方体边长 */
const CUBE_SIZE = 1.6;

function loadImageElement(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    /**
     * 为什么不用 new Image()？
     * - 这个项目开了 antd 自动导入
     * - 当前作用域里的 Image 容易让人联想到 antd 的组件，而不是浏览器原生构造函数
     */
    const image = document.createElement('img');
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

/**
 * 将全景图横向均分为 6 份，对应立方体 6 个面
 *
 *
 * 裁切顺序与 BoxGeometry 材质索引一致：
 * 0:+x  1:-x  2:+y  3:-y  4:+z  5:-z
 *
 * 说明：
 * - 这是一种“为了容易理解”的简化做法
 * - 它能帮你先建立“盒子每一面都可以有自己的贴图”这个概念
 * - 但它不是严格的 cubemap 投影，所以视觉上不会像真正天空盒那样完全正确
 */
async function splitPanoramaIntoSixFaceTextures(loadImage: ImageModule) {
  const { default: url } = await loadImage();
  const image = await loadImageElement(url);

  const sliceWidth = Math.floor(image.width / 6);
  const sliceHeight = image.height;
  const textures: THREE.CanvasTexture[] = [];

  for (let i = 0; i < 6; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = sliceWidth;
    canvas.height = sliceHeight;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D 不可用');
    }

    ctx.drawImage(image, i * sliceWidth, 0, sliceWidth, sliceHeight, 0, 0, sliceWidth, sliceHeight);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
  }

  return textures;
}

/**
 * 懒加载贴图
 *
 *
 * 1. 先用 dynamic import()，等用户切到对应 tab 再拿图片地址
 * 2. 再用 TextureLoader，把图片真正变成 Three.js 能贴到模型上的纹理
 *
 */
async function loadTextureLazy(loadImage: ImageModule) {
  const { default: url } = await loadImage();
  const texture = await new THREE.TextureLoader().loadAsync(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

/**
 * 全景相机：把相机放到球心里
 */
function initPanoramaCamera(size: ContainerSize) {
  const camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
  camera.position.set(0, 0, 0);

  return camera;
}

/**
 * 地球球体：相机站在外面看它
 */
async function initEarthGlobe(
  scene: THREE.Scene,
  loadImage: ImageModule
): Promise<Disposable<BasicSceneModule>> {
  const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 32);
  const texture = await loadTextureLazy(loadImage);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  return {
    value: {
      onFrame(delta: number) {
        sphere.rotation.y += delta * 0.2;
      },
    },
    dispose() {
      sphere.removeFromParent();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}

/**
 * 全景球体：相机站在球里面看内壁
 */
async function initEquirectangularPanorama(
  scene: THREE.Scene,
  loadImage: ImageModule
): Promise<Disposable<BasicSceneModule>> {
  const geometry = new THREE.SphereGeometry(PANORAMA_SPHERE_RADIUS, 64, 32);
  const texture = await loadTextureLazy(loadImage);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  return {
    value: {},
    dispose() {
      sphere.removeFromParent();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}

/**
 * 六面立方体：把一张长图拆开，贴到盒子的 6 个面上
 */
async function initCubeMapBox(
  scene: THREE.Scene,
  loadImage: ImageModule
): Promise<Disposable<BasicSceneModule>> {
  const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
  const faceTextures = await splitPanoramaIntoSixFaceTextures(loadImage);

  const materials = faceTextures.map(
    (map) =>
      new THREE.MeshBasicMaterial({
        map,
      })
  );

  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);

  return {
    value: {
      onFrame(delta: number) {
        // cube.rotation.x += delta * 0.15;
        // cube.rotation.y += delta * 0.25;
      },
    },
    dispose() {
      cube.removeFromParent();
      geometry.dispose();

      for (const material of materials) {
        material.map?.dispose();
        material.dispose();
      }
    },
  };
}

const panoramaDemoFactories: Record<PanoramaDemoType, PanoramaDemoFactory> = {
  globe: initEarthGlobe,
  panorama: initEquirectangularPanorama,
  cube: initCubeMapBox,
};

const panoramaImageLoaders: Record<PanoramaDemoType, ImageModule> = {
  globe: () => import('@/assets/images/maps/earth-world-map-2048.jpg'),
  panorama: () => import('@/assets/images/panoramas/threejs-equirectangular.jpg'),
  cube: () => import('@/assets/images/panoramas/threejs-equirectangular.jpg'),
};

async function init(root: HTMLDivElement, demoType: PanoramaDemoType) {
  const stack = createDisposeStack();

  const size = getContainerSize(root);

  const scene = initScene();

  const renderer = stack.use(initRenderer(root, size));

  const timer = stack.use(initTimer());

  const stats = stack.use(initStats(root));

  const frameHandlers: SceneFrameHandler[] = [];

  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;

  if (demoType === 'panorama') {
    camera = initPanoramaCamera(size);
    controls = stack.use(initControls(camera, renderer.domElement));

    /**
     * 为什么 target 不能也放在 (0,0,0)？
     * - 因为全景模式下，相机自己就站在 (0,0,0)
     * - 如果“人站的位置”和“正在看的目标点”完全重合
     * - OrbitControls 就会不知道该围着谁转，拖拽会变得很奇怪，甚至失效
     *
     * 所以这里把 target 往前放一点：
     * - 不是把相机挪走
     * - 只是告诉控制器：“默认朝这个方向看”
     */
    controls.target.set(0, 0, -1);

    /**
     * 为什么禁止平移？
     * - 全景图最重要的前提，是“人站在原地转头”
     * - 一旦平移，相机就离开球心了
     * - 这时画面会马上变假，像你把脑袋伸进贴图里乱穿
     */
    controls.enablePan = false;

    /**
     * 为什么禁止缩放？
     * - 这里的缩放，本质上是把相机往前推或往后拉
     * - 但全景体验里，我们不是要靠近球壁去研究贴图细节
     * - 推来推去很容易贴到球壁上，甚至直接穿过去，沉浸感就没了
     */
    controls.enableZoom = false;

    /**
     * 为什么这里要用负值？
     * - 普通看模型时，你会觉得自己在“转模型”
     * - 全景模式里，我们更希望感觉像“自己在转头”
     * - 方向反过来后，手感会更接近第一人称环顾
     *
     * 为什么数值还故意小一点？
     * - 全景转太快，人会很容易晕
     * - 慢一点，更像人在平稳地看四周
     */
    controls.rotateSpeed = -0.25;
    controls.update();
  } else {
    camera = initCamera(size);
    controls = stack.use(initControls(camera, renderer.domElement));

    if (demoType === 'globe') {
      /**
       * 为什么给地球模式设置最小距离？
       * - 因为我们要的是“站在外面看地球”
       * - 如果镜头能无限贴近，最后就会直接钻进球里
       * - 一旦钻进去，教学体验就乱了：你看到的就不再是地球，而是穿模
       */
      controls.minDistance = GLOBE_RADIUS + 0.2;
    } else {
      /**
       * 立方体模式也类似：
       * - 太近会贴脸，看不清整体
       * - 留一点距离，更容易看出“六个面分别贴了图”
       */
      controls.minDistance = CUBE_SIZE * 0.9;
    }

    /**
     * 为什么还要限制最大距离？
     * - 不限制的话，可以把镜头拉得特别远
     * - 远到最后只剩一个小点，教学上就失去观察意义了
     */
    controls.maxDistance = 20;
    controls.update();
  }

  stack.use(initAxesHelper(scene));

  const demo = stack.use(
    await panoramaDemoFactories[demoType](scene, panoramaImageLoaders[demoType])
  );
  if (demo.onFrame) {
    frameHandlers.push(demo.onFrame);
  }

  stack.use(startRenderLoop({ renderer, scene, camera, controls, timer, stats, frameHandlers }));

  stack.use(initResizeObserver({ root, camera, renderer }));

  return () => {
    stack.dispose();
  };
}

export default function Panorama() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<PanoramaDemoType>('globe');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const el = rootRef.current;

    if (!el) return;

    let cancelled = false;
    let disposeScene: (() => void) | undefined;

    setLoading(true);

    init(el, activeTab)
      .then((dispose) => {
        if (cancelled) {
          dispose();
          return;
        }

        disposeScene = dispose;
        setLoading(false);
      })
      .catch((error) => {
        console.error('全景场景初始化失败', error);

        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      /**
       * 为什么 cleanup 里要先标记 cancelled？
       * - 因为这里有异步加载
       * - 旧 tab 的请求，可能比新 tab 更晚回来
       * - 如果不拦一下，旧场景就可能“死灰复燃”，把新场景又盖掉
       *
       * cancelled 可以理解成一句大白话：
       * “这一轮已经作废了，你后面就算加载完，也别再往页面上挂了。”
       */
      cancelled = true;
      disposeScene?.();
    };
  }, [activeTab]);

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        items={PANORAMA_DEMO_TABS}
        onChange={(key) => setActiveTab(key as PanoramaDemoType)}
        className="mb-3"
      />
      <Spin spinning={loading} tip="贴图加载中..." className="w-full">
        <div className="relative h-[520px] w-full rounded-lg overflow-hidden bg-black/5">
          <div ref={rootRef} className="relative h-full w-full" />
        </div>
      </Spin>
    </div>
  );
}
