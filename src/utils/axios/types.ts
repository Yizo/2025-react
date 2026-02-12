import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { ReactNode } from 'react';

/**
 * 自定义 Axios 请求配置
 */
export interface CustomAxiosRequestConfig<T = any> extends AxiosRequestConfig<T> {
  // 是否显示错误信息
  showErrorMessage?: boolean;
  // 加载文案
  loadingText?: string | ReactNode;
  // 是否显示加载中, 默认false
  showLoading?: boolean;
  // 请求前拦截 - 可以修改请求配置，增加请求头
  onBeforeRequest?: (_config: CustomAxiosRequestConfig<T>) => CustomAxiosRequestConfig<T>;
  // 响应前拦截 - 允许用户对响应进行最终处理，返回指定类型的响应数据
  onBeforeResponse?: (_response: AxiosResponse) => ApiResponse<T>;
  onError?: (_error: AxiosError) => void;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  // axios原始响应对象, 用于获取响应头、状态码等信息
  axiosResponse: AxiosResponse;
  [key: string]: any;
}
