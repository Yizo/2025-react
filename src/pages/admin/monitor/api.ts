import { request } from '@/services';
import type { BusinessSystem, CreateBusinessSystemDto, UpdateBusinessSystemDto } from './types';

const BASE = '/api/error-report';

export function getBusinessSystemList(params: Record<string, unknown>) {
  return request.get('/api/error-report/systems/list', { params });
}

export function getBusinessSystem(id: number) {
  return request.get<BusinessSystem>(`${BASE}/systems/${id}`);
}

export function createBusinessSystem(data: CreateBusinessSystemDto) {
  return request.post(`${BASE}/systems/create`, data);
}

export function updateBusinessSystem(data: UpdateBusinessSystemDto) {
  return request.post(`${BASE}/systems/update`, data);
}

export function removeBusinessSystem(id: number) {
  return request.post(`${BASE}/systems/remove/${id}`);
}

export function getMonitorLogList(params: { systemId: number; page?: number; pageSize?: number }) {
  return request.get(`${BASE}/logs`, { params });
}
