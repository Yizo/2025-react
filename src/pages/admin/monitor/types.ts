import type { MonitorEventType } from '@gomain-fe/monitor-types';

export type { MonitorEventType };

/** 业务系统（monitor_biz_systems） */
export interface BusinessSystem {
  id: number;
  appId: string;
  name: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessSystemDto {
  name: string;
  enabled?: boolean;
}

export interface UpdateBusinessSystemDto {
  id: number;
  name?: string;
  enabled?: boolean;
}

/** 监控日志（client_errors） */
export interface ClientErrorRecord {
  id: string;
  type: MonitorEventType;
  message: string;
  timestamp?: string;
  url?: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  systemId?: number;
  appId: string;
  release?: string;
  context?: Record<string, string | number | boolean | null>;
  userAgent?: string;
  ip?: string;
  createdAt: string;
}

export const EVENT_TYPE_OPTIONS: { label: string; value: MonitorEventType }[] = [
  { label: '运行时错误', value: 'runtime-error' },
  { label: 'Promise 错误', value: 'promise-error' },
  { label: '资源错误', value: 'resource-error' },
  { label: '请求错误', value: 'request-error' },
  { label: 'Vue 错误', value: 'vue-error' },
  { label: 'React 错误', value: 'react-error' },
  { label: 'SDK 错误', value: 'sdk-error' },
  { label: '捕获错误', value: 'caught-error' },
  { label: '手动上报', value: 'manual-error' },
];

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
