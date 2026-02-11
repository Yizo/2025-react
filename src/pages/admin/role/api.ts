import { request } from '@/services';

interface RoleDTO {
  name: string;
  code: string;
  description: string;
}

export function getRoleList(params: Record<string, any>) {
  return request.get('/api/roles/list', {
    params,
  });
}

export function createRole(data: RoleDTO) {
  return request.post('/api/roles/create', data);
}

export function updateRole(data: RoleDTO & { id: string }) {
  return request.post('/api/roles/update', data);
}

export function deleteRole(id: string) {
  return request.post(`/api/roles/remove/${id}`);
}
