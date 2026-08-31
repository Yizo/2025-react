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
    const status = error.response?.status;
    if (status === 401 || status === 491) {
      store.dispatch(clearUser());
    }
  },
};

const { request, cancel } = requestAxios(config);
const { request: adminRequest } = requestAxios({
  ...config,
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL ?? '/api/v1',
});

export { request, adminRequest, cancel };
