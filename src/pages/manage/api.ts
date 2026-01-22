import { request } from '@/services';

export interface ListItem {
  id: string | number;
  title: string;
}

export interface ListResponse {
  list: ListItem[];
  total: number;
}

export function getList() {
  // 根据你的实际后端响应格式选择对应的实现方式
  return request.get<ListResponse>('/v1/api/list');
}
