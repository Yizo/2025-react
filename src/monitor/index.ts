import { createWebMonitor } from '@gomain-fe/monitor-web';
import type {
  MonitorConfig,
  MonitorContext,
  MonitorEvent,
  MonitorEventMeta,
  MonitorEventType,
  MonitorInstance,
} from '@gomain-fe/monitor-types';
import store from '@/store';

/** 每次上报前动态补齐的业务上下文（仅可序列化简单值） */
export function getMonitorContext(): MonitorContext {
  const { userInfo } = store.getState().user;
  const userId = userInfo?.id;

  return {
    page: window.location.pathname,
    href: window.location.href,
    env: import.meta.env.MODE,
    ...(userId != null ? { userId: String(userId) } : {}),
  };
}

/** 优先 sendBeacon（Blob 带 application/json），失败回退 fetch */
function createMonitorTransport(dsn: string): NonNullable<MonitorConfig['transport']> {
  return async (payloads) => {
    const ingestKey = import.meta.env.VITE_MONITOR_INGEST_KEY;
    if (!ingestKey) return;

    const body = JSON.stringify(
      payloads.map((payload) => ({
        ...payload,
        ingestKey,
      }))
    );

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(dsn, blob)) return;
    }

    await fetch(dsn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  };
}

export function createAppMonitor(): MonitorInstance {
  const dsn = import.meta.env.VITE_MONITOR_URL;
  const transport = dsn ? createMonitorTransport(dsn) : async () => undefined;
  const config: MonitorConfig = {
    appId: import.meta.env.VITE_MONITOR_APP_ID ?? '',
    dsn,
    release: import.meta.env.VITE_MONITOR_RELEASE,
    error: true,
    context: getMonitorContext,
    transport,
  };

  return createWebMonitor(config);
}

export function initMonitor(): MonitorInstance {
  const monitor = createAppMonitor();
  monitor.start();
  window.goMainMonitor = monitor;
  return monitor;
}

/** 构造 capture 入参（SDK 0.1.3+ 仅接受 Error） */
export function createMonitorEvent(
  type: MonitorEventType,
  error: Error | string,
  meta?: MonitorEventMeta
): MonitorEvent {
  return {
    type,
    error: typeof error === 'string' ? new Error(error) : error,
    ...meta,
  };
}

/** 类型安全的业务侧上报入口 */
export function captureMonitorEvent(event: MonitorEvent): void {
  window.goMainMonitor?.capture(event);
}

export type {
  MonitorConfig,
  MonitorContext,
  MonitorContextValue,
  MonitorEvent,
  MonitorEventMeta,
  MonitorEventType,
  MonitorInstance,
  MonitorPayload,
  MonitorRequestErrorOptions,
} from '@gomain-fe/monitor-types';
