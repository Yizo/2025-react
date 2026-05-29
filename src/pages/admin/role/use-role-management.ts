import { App } from 'antd';
import { createRole, deleteRole, updateRole } from './api';

export function useRoleManagement() {
  const [open, setOpen] = useState(false);
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  async function onDeleteRole(id: string) {
    if (loading) return;
    try {
      setLoading(true);
      await deleteRole(id);
    } finally {
      setLoading(false);
    }
    message.success('删除成功');
  }

  async function onEditRole(record: any) {
    if (loading) return;
    try {
      setLoading(true);
      await updateRole(record);
    } finally {
      setLoading(false);
    }
    message.success('编辑成功');
  }

  async function onAddRole(record: any) {
    if (loading) return;
    try {
      setLoading(true);
      await createRole(record);
    } finally {
      setLoading(false);
    }
    message.success('新增成功');
  }

  return {
    open,
    setOpen,
    loading,
    onDeleteRole,
    onEditRole,
    onAddRole,
  };
}
