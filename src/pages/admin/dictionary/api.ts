import { request } from '@/services';

// 类型列表
export function getDictionaryTypeList(params: Record<string, any>) {
  return request.get('/api/dictionary/types/list', {
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

// 字典数据列表
export function getDictionaryDataList(params: Record<string, any>) {
  return request.get('/api/dictionary/data/list', {
    params,
  });
}

// 新增字典数据
export function fetchAddDictionaryData(data: Record<string, any>) {
  return request.post('/api/dictionary/data/create', data);
}

// 编辑字典数据
export function fetchEditDictionaryData(data: Record<string, any>) {
  return request.post(`/api/dictionary/data/update/`, data);
}

// 删除字典数据
export function fetchDeleteDictionaryData(data: Record<string, any>) {
  return request.post(`/api/dictionary/data/delete`, data);
}
