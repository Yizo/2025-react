import { useRequest as requestAxios } from '@/utils/axios';
import { message } from 'antd';
import type { CustomAxiosRequestConfig, ApiResponse } from '@/utils/axios/types';
import type { AxiosRequestHeaders } from 'axios';
import { AxiosError } from 'axios';

const config: CustomAxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {} as AxiosRequestHeaders,
  showErrorMessage: true,
  onBeforeRequest: (config) => {
    return config;
  },
  onBeforeResponse: (response): ApiResponse => {
    console.log('onBeforeResponse', response);
    const { data } = response;
    if (data?.code === 0) {
      return {
        code: data.code,
        message: data.message,
        data: data.data,
        axiosResponse: response,
      };
    }
    message.error(data.message);
    throw new AxiosError(
      data.message,
      data.code.toString(),
      response.config,
      response.request,
      response
    );
  },
};

const { request, cancel } = requestAxios(config);

export { request, cancel };
