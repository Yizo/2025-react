import { request } from '@/services';

// 类型列表
export function getDictionaryTypeList(params: Record<string, any>) {
  return request.get('/api/dictionary/types', {
    params,
  });
}

// 新增类型
export function fetchAddDictionaryType(data: Record<string, any>) {
  return request.post('/api/dictionary/types/create', data);
}

// 编辑类型
export function fetchEditDictionaryType(data: Record<string, any>) {
  return request.post(`/api/dictionary/types/update/`, data);
}

// 删除类型
export function fetchDeleteDictionaryType(id: string) {
  return request.post(`/api/dictionary/types/delete/${id}`);
}
