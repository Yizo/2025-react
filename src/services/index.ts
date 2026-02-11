import { useRequest as requestAxios } from '@/utils/axios';
import { message } from 'antd';
import type { CustomAxiosRequestConfig, ApiResponse } from '@/utils/axios/types';
import type { AxiosRequestHeaders } from 'axios';
import { AxiosError } from 'axios';
import store from '@/store';
import { clearUser } from '@/store/user';

const config: CustomAxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {} as AxiosRequestHeaders,
  showErrorMessage: true,
  onBeforeRequest: (config) => {
    const state = store.getState();
    const token = state.user.token;
    if (token) {
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  onBeforeResponse: (response): ApiResponse => {
    console.log('onBeforeResponse', response);
    const { data } = response;
    if (data?.code === 0) {
      return {
        ...data,
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
  onError: (error) => {
    console.log('onError', error);
    if (error.status === 491) {
      store.dispatch(clearUser());
    }
  },
};

const { request, cancel } = requestAxios(config);

export { request, cancel };
