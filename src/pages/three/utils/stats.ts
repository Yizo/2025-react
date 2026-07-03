import Stats from 'three/addons/libs/stats.module.js';
import type { OverlayPosition, StatsPanel } from './types';

export type StatsOptions = {
  panel?: StatsPanel;
  position?: OverlayPosition;
};

/**
 * 创建性能监控面板
 *
 * Stats:
 * - 用于查看 FPS、每帧耗时、内存等调试信息
 * - 本质上是一个 DOM 面板
 *
 * 注意：
 * - 这里只创建和初始化 stats
 * - 不负责把 stats.dom 挂到哪个容器里
 */
export function initStats(options: StatsOptions = {}): Stats {
  const {
    panel = 0,
    position = {
      top: '0px',
      right: '0px',
      left: 'auto',
      zIndex: '1000',
    },
  } = options;
  const stats = new Stats();

  stats.showPanel(panel);

  stats.dom.style.position = 'absolute';
  stats.dom.style.top = position.top ?? '';
  stats.dom.style.right = position.right ?? '';
  stats.dom.style.bottom = position.bottom ?? '';
  stats.dom.style.left = position.left ?? '';
  stats.dom.style.zIndex = position.zIndex ?? '1000';

  return stats;
}
