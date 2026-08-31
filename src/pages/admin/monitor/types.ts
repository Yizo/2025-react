import type { MonitorEventType } from '@gomain-fe/monitor-types';

export type { MonitorEventType };

export interface MonitorApp {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorAppPageResult {
  items: MonitorApp[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CreateMonitorAppInput {
  code: string;
  name: string;
}

export interface UpdateMonitorAppInput {
  name?: string;
  enabled?: boolean;
}

export interface CreateMonitorAppResult {
  id: string;
  ingestKey: string;
}

export interface ClientErrorRecord {
  id: string;
  eventId: string;
  fingerprint: string;
  message: string;
  occurredAt: string;
  stack?: string;
  appId: string;
  context?: Record<string, unknown>;
  processedAt?: string | null;
  createdAt: string;
}

export interface ClientErrorCursorResult {
  items: ClientErrorRecord[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const EVENT_TYPE_LABELS: Record<MonitorEventType, string> = {
  'runtime-error': '运行时错误',
  'promise-error': 'Promise 错误',
  'resource-error': '资源错误',
  'request-error': '请求错误',
  'vue-error': 'Vue 错误',
  'react-error': 'React 错误',
  'sdk-error': 'SDK 错误',
  'caught-error': '捕获错误',
  'manual-error': '手动上报',
};

export const EVENT_TYPE_COLORS: Record<MonitorEventType, string> = {
  'runtime-error': 'red',
  'promise-error': 'volcano',
  'resource-error': 'orange',
  'request-error': 'gold',
  'vue-error': 'purple',
  'react-error': 'magenta',
  'sdk-error': 'geekblue',
  'caught-error': 'cyan',
  'manual-error': 'blue',
};
