import type { AxiosRequestConfig, GenericAbortSignal } from 'axios';
import type { ReactNode } from 'react';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean;
  signal?: AbortSignal | GenericAbortSignal;
  loadingText?: string | ReactNode;
}
