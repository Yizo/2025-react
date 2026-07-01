import { useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { createDisposeStack } from './utils';
import {
  getContainerSize,
  initCamera,
  initControls,
  initAxesHelper,
  initTimer,
  initStats,
  type ContainerSize,
} from './basic-scene-factory';
import type { Disposable } from './types';

type Css3DDemoType = 'single';

const CSS3D_DEMO_TABS: { key: Css3DDemoType; label: string }[] = [
  { key: 'single', label: '单卡片' },
];

function createCardElement(label: string, color: string) {
  const element = document.createElement('div');

  element.textContent = label;
  element.style.width = 'auto';
  element.style.height = 'auto';
  element.style.display = 'flex';
  element.style.alignItems = 'center';
  element.style.justifyContent = 'center';
  element.style.borderRadius = '8px';
  element.style.color = '#fff';
  element.style.fontSize = '14px';
  element.style.fontWeight = '600';
  element.style.background = color;
  element.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
  element.style.userSelect = 'none';
  element.style.padding = '5px 10px';

  return element;
}

function initWebglOverlayRenderer(root: HTMLDivElement, size: ContainerSize) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size.width, size.height);
  renderer.setClearColor(0x000000, 0);

  /**
   * 透明 WebGL 层垫在 CSS3D 下方，只负责画 AxesHelper 等线条/网格。
   * 必须先插入 DOM，再叠 CSS3D 层，否则 canvas 会挡住 HTML 卡片。
   */
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';

  root.appendChild(renderer.domElement);

  return {
    value: renderer,
    dispose() {
      renderer.dispose();

      if (renderer.domElement.parentElement === root) {
        root.removeChild(renderer.domElement);
      }
    },
  };
}

function initCss3DRenderer(root: HTMLDivElement, size: ContainerSize) {
  const cssRenderer = new CSS3DRenderer();

  cssRenderer.setSize(size.width, size.height);

  /**
   * CSS3DRenderer 输出的是普通 DOM，需要叠在容器里。
   * 绝对定位 + 铺满容器，才能和 WebGL canvas 对齐。
   */
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = '0';
  cssRenderer.domElement.style.left = '0';
  cssRenderer.domElement.style.pointerEvents = 'none';

  root.appendChild(cssRenderer.domElement);

  return {
    value: cssRenderer,
    dispose() {
      if (cssRenderer.domElement.parentElement === root) {
        root.removeChild(cssRenderer.domElement);
      }
    },
  };
}

function initSingleCard(scene: THREE.Scene) {
  const object = new CSS3DObject(createCardElement('CSS3D 卡片', 'transparent'));
  object.scale.set(1 / 20, 1 / 20, 1 / 20);
  scene.add(object);

  return {
    value: {
      onFrame(delta: number) {
        // object.rotation.y += delta * 0.6;
        object.rotation.x += delta * 0.3;
      },
    },
    dispose() {
      object.removeFromParent();
    },
  };
}

const css3dDemoFactories: Record<
  Css3DDemoType,
  (_scene: THREE.Scene) => Disposable<{ onFrame?: (_delta: number) => void }>
> = {
  single: initSingleCard,
};

function init(root: HTMLDivElement, demoType: Css3DDemoType) {
  const stack = createDisposeStack();

  /**
   * 1. 读取容器尺寸
   * CSS3DRenderer 和相机投影都依赖宽高，后续 resize 时也会同步更新。
   */
  const size = getContainerSize(root);

  /**
   * 2. 容器设为 relative
   * CSS3DRenderer 输出的 DOM 使用 absolute 叠在容器内，父级需要定位上下文。
   */
  root.style.position = 'relative';

  /**
   * 3. 创建场景与相机
   * CSS3D 与 WebGL 共用同一套 Scene / Camera，只是渲染出口不同。
   */
  const scene = new THREE.Scene();
  const camera = initCamera(size);

  /**
   * 4. 创建 WebGL 叠加层
   * AxesHelper 是线段几何体，只能由 WebGLRenderer 绘制；
   * CSS3DRenderer 只会处理 CSS3DObject，scene.add(axesHelper) 对它无效。
   */
  const webglRenderer = stack.use(initWebglOverlayRenderer(root, size));

  /**
   * 5. 创建 CSS3D 渲染器
   * 把 HTML 元素映射到 3D 空间，输出为普通 DOM 而非 canvas。
   */
  const cssRenderer = stack.use(initCss3DRenderer(root, size));

  /**
   * 6. 坐标轴辅助线（走 WebGL 层渲染）
   */
  stack.use(initAxesHelper(scene));

  /**
   * 7. 创建轨道控制器
   * controls 绑定 WebGL canvas，拖拽旋转更顺手。
   */
  const controls = stack.use(initControls(camera, webglRenderer.domElement));

  /**
   * 8. 计时器与性能面板
   */
  const timer = stack.use(initTimer());
  const stats = stack.use(initStats(root));

  /**
   * 9. 按当前 tab 注册场景内容
   * 工厂函数向 scene 添加 CSS3DObject，并可返回 onFrame 做每帧动画。
   */
  const demo = stack.use(css3dDemoFactories[demoType](scene));

  let animationFrameId = 0;

  /**
   * 10. 单帧渲染
   * 先 WebGL（辅助线），再 CSS3D（HTML 卡片）；CSS3DRenderer 没有 setAnimationLoop。
   */
  const render = (timestamp?: number) => {
    stats.begin();
    timer.update(timestamp);

    const delta = timer.getDelta();

    demo.onFrame?.(delta);
    controls.update();

    webglRenderer.render(scene, camera);
    cssRenderer.render(scene, camera);

    stats.end();
  };

  /**
   * 11. 启动渲染循环
   */
  const loop = (timestamp: number) => {
    render(timestamp);
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  stack.use({
    value: null,
    dispose() {
      cancelAnimationFrame(animationFrameId);
    },
  });

  /**
   * 12. 监听容器尺寸变化
   * 同步更新相机宽高比与两个渲染器的输出尺寸。
   */
  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = getContainerSize(root);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    webglRenderer.setSize(width, height);
    cssRenderer.setSize(width, height);
  });

  resizeObserver.observe(root);

  stack.use({
    value: resizeObserver,
    dispose() {
      resizeObserver.disconnect();
    },
  });

  /**
   * 13. 返回清理函数
   * React useEffect cleanup 时调用，stack 会依次释放 rAF、ResizeObserver、DOM 等。
   */
  return () => {
    stack.dispose();
  };
}

export default function Css3DScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Css3DDemoType>('single');

  useEffect(() => {
    const el = rootRef.current;

    if (!el) return;

    return init(el, activeTab);
  }, [activeTab]);

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        items={CSS3D_DEMO_TABS}
        onChange={(key) => setActiveTab(key as Css3DDemoType)}
        className="mb-3"
      />
      <div
        ref={rootRef}
        className="relative h-[520px] w-full overflow-hidden rounded-lg bg-black/5"
      />
    </div>
  );
}
