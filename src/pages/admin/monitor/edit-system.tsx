import { Switch } from 'antd';
import type { MonitorApp } from './types';

export interface EditMonitorAppModalProps {
  open: boolean;
  record?: MonitorApp;
  loading: boolean;
  onOk: (_values: { code: string; name: string; enabled: boolean }) => void;
  onCancel?: () => void;
}

export function EditMonitorAppModal({
  open,
  record,
  loading,
  onOk,
  onCancel,
}: EditMonitorAppModalProps) {
  const [form] = Form.useForm();

  function handleOk() {
    form.validateFields().then((values) => onOk(values));
  }

  useEffect(() => {
    if (record) {
      form.setFieldsValue({ code: record.code, name: record.name, enabled: record.enabled });
    } else {
      form.resetFields();
      form.setFieldsValue({ enabled: true });
    }
    return () => form.resetFields();
  }, [form, record, open]);

  return (
    <Modal
      title={record ? '编辑监控应用' : '新增监控应用'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" className="pt-4!">
        <Form.Item
          label="应用编码"
          name="code"
          rules={[
            { required: true, message: '请输入应用编码' },
            { max: 80, message: '应用编码不能超过80个字符' },
            { min: 2, message: '应用编码不能少于2个字符' },
          ]}
        >
          <Input disabled={!!record} placeholder="例如 survey-admin" />
        </Form.Item>
        <Form.Item
          label="应用名称"
          name="name"
          rules={[{ required: true, message: '请输入应用名称' }, { max: 120 }]}
        >
          <Input placeholder="监控应用名称" />
        </Form.Item>
        <Form.Item label="状态" name="enabled" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
