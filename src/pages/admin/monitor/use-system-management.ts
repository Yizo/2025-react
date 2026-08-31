import { useState } from 'react';
import { App } from 'antd';
import { createMonitorApp, updateMonitorApp } from './api';
import type { MonitorApp } from './types';

export function useMonitorAppManagement() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  async function create(values: { code: string; name: string }) {
    if (loading) return;
    setLoading(true);
    try {
      const response = await createMonitorApp(values);
      message.success('监控应用创建成功');
      return response.data;
    } finally {
      setLoading(false);
    }
  }

  async function update(app: MonitorApp, values: { name: string; enabled: boolean }) {
    if (loading) return;
    setLoading(true);
    try {
      await updateMonitorApp(app.id, values);
      message.success('监控应用更新成功');
    } finally {
      setLoading(false);
    }
  }

  async function setEnabled(app: MonitorApp, enabled: boolean) {
    if (loading) return;
    setLoading(true);
    try {
      await updateMonitorApp(app.id, { enabled });
      message.success(enabled ? '监控应用已启用' : '监控应用已禁用');
    } finally {
      setLoading(false);
    }
  }

  return { loading, create, update, setEnabled };
}
