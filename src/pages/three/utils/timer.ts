import * as THREE from 'three';
import type { Disposable } from './types';

/**
 * 创建计时器
 *
 * Timer:
 * - 用来计算逐帧 delta
 * - 也可以读取累计运行时间
 *
 * 为什么需要 delta？
 *
 * 如果直接写：
 * mesh.rotation.y += 0.01
 *
 * 问题是：
 * - 高帧率设备每秒执行次数更多，动画会更快
 * - 低帧率设备每秒执行次数更少，动画会更慢
 *
 * 使用 delta 后：
 * - 动画速度和帧率解耦
 * - 不同设备上的表现更稳定
 */
export function initTimer(): Disposable<THREE.Timer> {
  const timer = new THREE.Timer();

  /**
   * 连接 document
   *
   * connect(document):
   * - 不是绝对必须
   * - 但可以让 Timer 感知页面可见性变化
   *
   * 这样从后台页切回来时，
   * 不容易出现一个异常巨大的 delta。
   */
  timer.connect(document);

  return {
    value: timer,

    /**
     * 释放 Timer 内部资源
     */
    dispose() {
      timer.dispose();
    },
  };
}
