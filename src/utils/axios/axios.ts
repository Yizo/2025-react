import axios from 'axios';
import type {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';
import { message } from 'antd';

import useUserStore from '@/store/user';
import useSystemStore from '@/store/system';
import { requestCancelManager } from './cancelManager';
import type { CustomAxiosRequestConfig } from './types';

let loadingInstance: ReturnType<typeof message.loading> | null = null;

function LoadingManager() {
  function openLoading(text = '加载中...') {
    const currentLoading = useSystemStore.getState().loading;
    if (currentLoading === 0) {
      loadingInstance = message.loading(text, 0);
    }
    useSystemStore.getState().addLoading();
  }

  function destroyLoading() {
    useSystemStore.getState().removeLoading();
    const afterRemove = useSystemStore.getState().loading;
    if (afterRemove === 0) {
      loadingInstance?.();
      loadingInstance = null;
    }
  }

  return {
    openLoading,
    destroyLoading,
  };
}

const { openLoading, destroyLoading } = LoadingManager();

/**
 * 请求拦截器
 */
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // 获取 token 并添加到 header
  const token = useUserStore.getState().token;
  openLoading();
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 如果没有提供 signal，则使用管理器创建的 signal
  if (config.url && !config.signal) {
    const url = config.url || '';
    const method = config.method || 'GET';
    const controller = requestCancelManager.getController(url, method);
    config.signal = controller.signal;
  }

  return config;
};

/**
 * 请求错误拦截器
 */
const requestErrorInterceptor = (error: AxiosError) => {
  console.error('[请求错误]', error.message);
  return Promise.reject(error);
};

/**
 * 响应拦截器
 */
const responseInterceptor = (response: AxiosResponse) => {
  const { data, request, config } = response;
  destroyLoading();
  // 清除该请求的 cancel token
  const url = config.url || '';
  const method = config.method || 'GET';
  requestCancelManager.clear(url, method);

  // 如果是非json
  if (request?.responseType !== 'json') {
    return response;
  }

  return data;
};

/**
 * 响应错误拦截器
 */
const errorInterceptor = (error: AxiosError) => {
  console.log('[响应错误]', error);
  destroyLoading();
  const config = error.config as CustomAxiosRequestConfig;

  // 清除该请求的 cancel token
  if (config) {
    const url = config.url || '';
    const method = config.method || 'GET';
    requestCancelManager.clear(url, method);
  }

  const errorData = error.response?.data as Record<string, any>;
  const errorMessage = errorData?.message || error.message || '请求失败，请重试';

  const showErrorMessage = (msg: string) => {
    if (config?.showErrorMessage) {
      message.error(msg);
    }
  };

  // 如果是取消请求，不显示错误提示
  if (error.code === 'ERR_CANCELED') {
    return Promise.reject(error);
  }

  // 有响应（HTTP 状态码异常）
  if (error.response) {
    showErrorMessage(errorMessage);
    return Promise.reject(error);
  }

  // 请求发出了，但没收到响应: 网络错误 / 超时
  if (error.request) {
    showErrorMessage(errorMessage);
    return Promise.reject(error);
  }

  showErrorMessage(errorMessage);

  // 其他（配置错误、拦截器异常）
  return Promise.reject(error);
};

/**
 * 创建 axios 实例
 */
export const createRequestInstance = (config?: CustomAxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
    timeout: 1000 * 60, // 60秒
    showErrorMessage: true,
    ...config,
  });

  // 注册请求拦截器
  instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

  // 注册响应拦截器
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);

  return instance;
};

/**
 * 创建单例 axios 实例
 */
const axiosInstance = createRequestInstance();

/**
 * 导出简化的请求方法
 */
export const request = {
  get: <R = any>(url: string, config?: CustomAxiosRequestConfig) =>
    axiosInstance.get<R, R>(url, config),

  post: <D = any, R = any>(url: string, data?: D, config?: CustomAxiosRequestConfig) =>
    axiosInstance.post<R, R>(url, data, config),

  put: <D = any, R = any>(url: string, data?: D, config?: CustomAxiosRequestConfig) =>
    axiosInstance.put<R, R>(url, data, config),

  delete: <R = any>(url: string, config?: CustomAxiosRequestConfig) =>
    axiosInstance.delete<R, R>(url, config),

  patch: <D = any, R = any>(url: string, data?: D, config?: CustomAxiosRequestConfig) =>
    axiosInstance.patch<R, R>(url, data, config),

  /**
   * 取消特定请求
   */
  cancel: (url: string, method: string = 'GET') => {
    requestCancelManager.cancel(url, method);
  },

  /**
   * 取消所有请求
   */
  cancelAll: () => {
    requestCancelManager.cancelAll();
  },

  /**
   * 获取原始 axios 实例，用于高级用法
   */
  getInstance: () => axiosInstance,
};

/**
 * 多功能 request - 返回包含 promise 和 cancel 方法的对象
 */
export const requestManual = {
  get: <R = any>(url: string, config?: CustomAxiosRequestConfig) => ({
    promise: () => request.get<R>(url, config),
    cancel: () => request.cancel(url, 'GET'),
  }),

  post: <D = any, R = any>(url: string, data?: D, config?: CustomAxiosRequestConfig) => ({
    promise: () => request.post<D, R>(url, data, config),
    cancel: () => request.cancel(url, 'POST'),
  }),

  put: <D = any, R = any>(url: string, data?: D, config?: CustomAxiosRequestConfig) => ({
    promise: () => request.put<D, R>(url, data, config),
    cancel: () => request.cancel(url, 'PUT'),
  }),

  delete: <R = any>(url: string, config?: CustomAxiosRequestConfig) => ({
    promise: () => request.delete<R>(url, config),
    cancel: () => request.cancel(url, 'DELETE'),
  }),

  patch: <D = any, R = any>(url: string, data?: D, config?: CustomAxiosRequestConfig) => ({
    promise: () => request.patch<D, R>(url, data, config),
    cancel: () => request.cancel(url, 'PATCH'),
  }),
};
