import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import store from '@/store';
import { addLoading, removeLoading } from '@/store/system';
import { requestCancelManager } from './cancelManager';
import type { CustomAxiosRequestConfig, ApiResponse } from './types';

let loadingInstance: ReturnType<typeof message.loading> | null = null;

function LoadingManager() {
  function openLoading(text = '加载中...') {
    const currentLoading = store.getState().system.loading;
    if (currentLoading === 0) {
      loadingInstance = message.open({ content: text, type: 'loading', duration: 0 });
    }
    store.dispatch(addLoading());
  }

  function destroyLoading() {
    store.dispatch(removeLoading());
    const afterRemove = store.getState().system.loading;
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
const requestInterceptor = (
  config: InternalAxiosRequestConfig<any>
): InternalAxiosRequestConfig<any> => {
  openLoading();
  const customConfig = config as CustomAxiosRequestConfig;

  if (customConfig.onBeforeRequest) {
    return customConfig.onBeforeRequest(customConfig) as InternalAxiosRequestConfig<any>;
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
const responseInterceptor = (response: AxiosResponse): any => {
  const { data } = response;
  const config = response.config as CustomAxiosRequestConfig;
  destroyLoading();
  // 清除该请求的 cancel token
  if (config.url) {
    const method = config.method || 'GET';
    requestCancelManager.clear(config.url, method);
  }

  if (config.onBeforeResponse) {
    return config.onBeforeResponse(response);
  }

  return {
    code: data?.code,
    message: data?.message,
    data: data?.data,
    axiosResponse: response,
  };
};

/**
 * 响应错误拦截器
 */
const errorInterceptor = (error: AxiosError) => {
  console.log('[响应错误]', error);
  destroyLoading();
  const config = error.config as CustomAxiosRequestConfig;
  // 清除该请求的 cancel token
  if (config.url) {
    const method = config.method || 'GET';
    requestCancelManager.clear(config.url, method);
  }

  const errorData = error.response?.data as Record<string, any>;
  const errorMessage = errorData?.message || error.message || '请求失败，请重试';

  const showErrorMessage = (msg: string) => {
    if (config?.showErrorMessage) {
      message.open({ content: msg, type: 'error' });
    }
  };

  const handleError = () => {
    if (error.code === 'ERR_CANCELED') {
      // 如果是取消请求，不显示错误提示
      return Promise.reject(error);
    }

    // 有响应（HTTP 状态码异常）
    if (error.response) {
      showErrorMessage(errorMessage);
      return Promise.reject(error);
    }

    // 请求发出了，但没收到响应: 网络错误 / 超时
    if (error.request) {
      showErrorMessage('网络错误/超时，请稍后再试');
      return Promise.reject(error);
    }

    showErrorMessage(errorMessage);

    // 其他（配置错误、拦截器异常）
    return Promise.reject(error);
  };

  if (config?.onError) {
    config.onError(error);
  }
  return handleError();
};

/**
 * 创建 axios 实例
 */
const createRequestInstance = (config?: CustomAxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
    timeout: 1000 * 60, // 60秒
    showErrorMessage: true,
    ...config,
  });

  // 注册请求拦截器
  instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

  // 注册响应拦截器
  instance.interceptors.response.use(responseInterceptor, errorInterceptor) as any;

  return instance;
};

export function useRequest(config: CustomAxiosRequestConfig) {
  const axiosInstance = createRequestInstance(config);

  const request = {
    get: <T = any, R = ApiResponse<T>>(url: string, config?: CustomAxiosRequestConfig) =>
      axiosInstance.get<T, R>(url, config),
    post: <T = any, R = ApiResponse<T>, D = any>(
      url: string,
      data?: D,
      config?: CustomAxiosRequestConfig<D>
    ) => axiosInstance.post<T, R, D>(url, data, config),
  };

  const cancel = (url: string, method: string = 'GET') => requestCancelManager.clear(url, method);
  return {
    request,
    cancel,
  };
}
