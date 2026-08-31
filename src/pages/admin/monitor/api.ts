import { request } from '@/services';
import type {
  ClientErrorCursorResult,
  CreateMonitorAppInput,
  CreateMonitorAppResult,
  MonitorAppPageResult,
  UpdateMonitorAppInput,
} from './types';

const BASE = '/api/monitoring';

export function getMonitorApps(params: {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  enabled?: boolean;
}) {
  return request.get<MonitorAppPageResult>(`${BASE}/apps`, { params });
}

export function createMonitorApp(data: CreateMonitorAppInput) {
  return request.post<CreateMonitorAppResult>(`${BASE}/apps`, data);
}

export function updateMonitorApp(id: string, data: UpdateMonitorAppInput) {
  return request.post(`${BASE}/apps/${id}/update`, data);
}

export function getClientErrors(params: {
  appId: string;
  pageSize?: number;
  cursor?: string;
  fingerprint?: string;
}) {
  return request.get<ClientErrorCursorResult>(`${BASE}/client-errors`, { params });
}
