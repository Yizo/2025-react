import { adminRequest } from '@/services';

export type Status = 0 | 1;

export type DataScope =
  | 'all'
  | 'custom'
  | 'department'
  | 'department_and_children'
  | 'self'
  | 'none';

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Role {
  id: number;
  roleName: string;
  roleCode: string;
  dataScope: DataScope;
  status: Status;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleQuery {
  page: number;
  pageSize: number;
  roleName?: string;
  roleCode?: string;
  dataScope?: DataScope;
  status?: Status;
}

export interface CreateRoleInput {
  roleName: string;
  roleCode: string;
  dataScope?: DataScope;
  status?: Status;
  remark?: string | null;
}

export type UpdateRoleInput = Partial<Omit<CreateRoleInput, 'roleCode'>>;

export interface User {
  id: number;
  userName: string;
  displayName: string;
  deptIds: number[];
  roleIds: number[];
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuery {
  page: number;
  pageSize: number;
  userName?: string;
  displayName?: string;
  deptId?: number;
  status?: Status;
}

export interface CreateUserInput {
  userName: string;
  displayName: string;
  password: string;
  deptIds?: number[];
  roleIds?: number[];
  status?: Status;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'userName'>>;

export interface Department {
  id: number;
  deptName: string;
  parentId: number | null;
  ancestors: string;
  sort: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
  children?: Department[];
}

export interface DepartmentQuery {
  page: number;
  pageSize: number;
  deptName?: string;
  parentId?: number;
  status?: Status;
}

export interface CreateDepartmentInput {
  deptName: string;
  parentId?: number | null;
  sort?: number;
  status?: Status;
}

export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

export interface DictType {
  id: number;
  dictName: string;
  dictType: string;
  status: Status;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DictTypeQuery {
  page: number;
  pageSize: number;
  dictName?: string;
  dictType?: string;
  status?: Status;
}

export interface CreateDictTypeInput {
  dictName: string;
  dictType: string;
  status?: Status;
  remark?: string | null;
}

export type UpdateDictTypeInput = Partial<Omit<CreateDictTypeInput, 'dictType'>>;

export interface DictData {
  id: number;
  dictType: string;
  label: string;
  value: string;
  sort: number;
  status: Status;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DictDataQuery {
  page: number;
  pageSize: number;
  dictType: string;
  label?: string;
  value?: string;
  status?: Status;
}

export interface CreateDictDataInput {
  dictType: string;
  label: string;
  value: string;
  sort?: number;
  status?: Status;
  remark?: string | null;
}

export type UpdateDictDataInput = Partial<Omit<CreateDictDataInput, 'dictType'>>;

export interface AppInfo {
  name: string;
  version: string;
  environment: string;
  message: string;
}

export interface HealthResult {
  status?: string;
  [key: string]: unknown;
}

export function getAppInfo() {
  return adminRequest.get<AppInfo>('/');
}

export function getLiveHealth() {
  return adminRequest.get<HealthResult>('/health/live');
}

export function getReadyHealth() {
  return adminRequest.get<HealthResult>('/health/ready');
}

export function initializeSystem() {
  return adminRequest.post<{ initialized?: boolean }>('/system/initialize');
}

export function getRoles(params: RoleQuery) {
  return adminRequest.get<PageResult<Role>>('/roles', { params });
}

export function getRole(id: number) {
  return adminRequest.get<Role>(`/roles/${id}`);
}

export function createRole(data: CreateRoleInput) {
  return adminRequest.post<Role>('/roles', data);
}

export function updateRole(id: number, data: UpdateRoleInput) {
  return adminRequest.post<Role>(`/roles/${id}/update`, data);
}

export function removeRole(id: number) {
  return adminRequest.post<Role>(`/roles/${id}/remove`);
}

export function getUsers(params: UserQuery) {
  return adminRequest.get<PageResult<User>>('/users', { params });
}

export function getUser(id: number) {
  return adminRequest.get<User>(`/users/${id}`);
}

export function createUser(data: CreateUserInput) {
  return adminRequest.post<User>('/users', data);
}

export function updateUser(id: number, data: UpdateUserInput) {
  return adminRequest.post<User>(`/users/${id}/update`, data);
}

export function removeUser(id: number) {
  return adminRequest.post<User>(`/users/${id}/remove`);
}

export function getDepartments(params: DepartmentQuery) {
  return adminRequest.get<PageResult<Department>>('/departments', { params });
}

export function getDepartment(id: number) {
  return adminRequest.get<Department>(`/departments/${id}`);
}

export function createDepartment(data: CreateDepartmentInput) {
  return adminRequest.post<Department>('/departments', data);
}

export function updateDepartment(id: number, data: UpdateDepartmentInput) {
  return adminRequest.post<Department>(`/departments/${id}/update`, data);
}

export function removeDepartment(id: number) {
  return adminRequest.post<Department>(`/departments/${id}/remove`);
}

export function getDictTypes(params: DictTypeQuery) {
  return adminRequest.get<PageResult<DictType>>('/dict/types', { params });
}

export function getDictType(id: number) {
  return adminRequest.get<DictType>(`/dict/types/${id}`);
}

export function createDictType(data: CreateDictTypeInput) {
  return adminRequest.post<DictType>('/dict/types', data);
}

export function updateDictType(id: number, data: UpdateDictTypeInput) {
  return adminRequest.post<DictType>(`/dict/types/${id}/update`, data);
}

export function removeDictType(id: number) {
  return adminRequest.post<DictType>(`/dict/types/${id}/remove`);
}

export function getDictData(params: DictDataQuery) {
  return adminRequest.get<PageResult<DictData>>('/dict/data', { params });
}

export function getDictDataItem(id: number) {
  return adminRequest.get<DictData>(`/dict/data/${id}`);
}

export function createDictData(data: CreateDictDataInput) {
  return adminRequest.post<DictData>('/dict/data', data);
}

export function updateDictData(id: number, data: UpdateDictDataInput) {
  return adminRequest.post<DictData>(`/dict/data/${id}/update`, data);
}

export function removeDictData(id: number) {
  return adminRequest.post<DictData>(`/dict/data/${id}/remove`);
}
