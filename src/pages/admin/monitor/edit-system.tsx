import { App, Switch } from 'antd';
import type { BusinessSystem } from './types';
import { createBusinessSystem, removeBusinessSystem, updateBusinessSystem } from './api';

export type EditSystemModalProps = {
  open: boolean;
  record?: BusinessSystem;
  loading: boolean;
  onOk: (values: { name: string; enabled: boolean }) => void;
  onCancel?: () => void;
};

export function EditSystemModal({ open, record, loading, onOk, onCancel }: EditSystemModalProps) {
  const [form] = Form.useForm();

  function handleOk() {
    form.validateFields().then((values) => onOk(values));
  }

  useEffect(() => {
    if (record) {
      form.setFieldsValue({ name: record.name, enabled: record.enabled });
    } else {
      form.resetFields();
      form.setFieldsValue({ enabled: true });
    }
    return () => form.resetFields();
  }, [record, open, form]);

  return (
    <Modal
      title={record ? '编辑业务系统' : '新增业务系统'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 5 }} className="pt-4!">
        {record && (
          <Form.Item label="App ID">
            <Typography.Text copyable>{record.appId}</Typography.Text>
          </Form.Item>
        )}
        <Form.Item
          label="系统名称"
          name="name"
          rules={[
            { required: true, message: '请输入系统名称' },
            { max: 128, message: '名称最多 128 个字符' },
          ]}
        >
          <Input placeholder="业务系统名称" />
        </Form.Item>
        <Form.Item label="状态" name="enabled" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function useSystemManagement() {
  const [open, setOpen] = useState(false);
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  async function onDelete(id: number) {
    if (loading) return;
    try {
      setLoading(true);
      await removeBusinessSystem(id);
      message.success('删除成功');
    } finally {
      setLoading(false);
    }
  }

  async function onEdit(record: BusinessSystem, values: { name: string; enabled: boolean }) {
    if (loading) return;
    try {
      setLoading(true);
      await updateBusinessSystem({ id: record.id, ...values });
      message.success('更新成功');
    } finally {
      setLoading(false);
    }
  }

  async function onAdd(values: { name: string; enabled: boolean }) {
    if (loading) return;
    try {
      setLoading(true);
      await createBusinessSystem(values);
      message.success('创建成功');
    } finally {
      setLoading(false);
    }
  }

  return { open, setOpen, loading, onDelete, onEdit, onAdd };
}
