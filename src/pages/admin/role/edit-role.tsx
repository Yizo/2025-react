export type EditRoleModalProps = {
  open: boolean;
  record?: any;
  loading: boolean;
  onOk: (values: any) => void;
  onCancel?: () => void;
};

export function EditRoleModal({ open, record, loading, onOk, onCancel }: EditRoleModalProps) {
  const [form] = Form.useForm();
  function handleOk() {
    form.validateFields().then((values) => {
      if (record) {
        onOk({
          ...record,
          ...values,
        });
      } else {
        onOk(values);
      }
    });
  }

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    return () => {
      form.resetFields();
    };
  }, [record, open]);
  return (
    <Modal
      title={record ? '编辑角色' : '新增角色'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      loading={loading}
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 4 }} className="pt-4!">
        <Form.Item
          label="角色名称"
          name="name"
          rules={[
            { required: true, message: '请输入角色名称' },
            { min: 1, max: 10, message: '角色名称长度为1-10位' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="角色编码"
          name="code"
          rules={[
            { required: true, message: '请输入角色编码' },
            { pattern: /^[1-9]\d*$/, message: '角色编码只能为数字' },
            { min: 1, max: 10, message: '角色编码长度为1-10位' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="描述"
          name="description"
          rules={[
            { required: true, message: '请输入角色描述' },
            { min: 1, max: 100, message: '角色描述长度为1-100位' },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
