import type { MonitorInstance } from '@gomain-fe/monitor-types';

declare global {
  interface Window {
    goMainMonitor: MonitorInstance;
  }
}

export {};
