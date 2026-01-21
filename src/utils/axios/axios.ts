import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestHeaders } from 'axios';
import { message } from 'antd';
import useUserStore from '@/store/user';
import useSystemStore from '@/store/system';
import { requestCancelManager } from './cancelManager';
import type { CustomAxiosRequestConfig, ApiResponse } from './types';

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
const requestInterceptor = (config: CustomAxiosRequestConfig) => {
  // 获取 token 并添加到 header
  const token = useUserStore.getState().token;
  openLoading();
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.onBeforeRequest) {
    return config.onBeforeRequest(config);
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
    showErrorMessage('网络错误/超时，请稍后再试');
    return Promise.reject(error);
  }

  showErrorMessage(errorMessage);

  // 其他（配置错误、拦截器异常）
  return Promise.reject(error);
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
    get: <T = any, R = ApiResponse<T>, D = any>(
      url: string,
      config?: CustomAxiosRequestConfig<D>
    ) => axiosInstance.get<T, R, D>(url, config),
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
