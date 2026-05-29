import { useNavigate } from 'react-router';
import { getBusinessSystemList } from './api';
import { EditSystemModal, useSystemManagement } from './edit-system';
import type { BusinessSystem } from './types';
import type { ColumnsType } from 'antd/es/table';

function useSearch() {
  const [form] = Form.useForm();
  const { tableProps, search } = useAntdTable(getTableData, {
    form,
    defaultParams: [{ current: 1, pageSize: 10, total: 0 }],
  });

  Object.assign(tableProps, {
    pagination: {
      ...tableProps.pagination,
      ...tableConfig.pagination,
    },
  });

  function getTableData(...args: Record<string, unknown>[]) {
    const [pagination, formData] = args;
    const { current, pageSize } = pagination as { current: number; pageSize: number };
    return getBusinessSystemList({
      page: current,
      pageSize,
      ...formData,
    }).then((res) => {
      return {
        list: res.data,
        total: res.total,
      };
    });
  }

  return { form, tableProps, search };
}

export default function BusinessSystemList() {
  const navigate = useNavigate();
  const { form, tableProps, search } = useSearch();
  const { open, setOpen, loading, onDelete, onEdit, onAdd } = useSystemManagement();
  const [record, setRecord] = useState<BusinessSystem>();

  function goToLogs(item: BusinessSystem) {
    navigate(`/admin/monitor/${item.id}`, { state: { system: item } });
  }

  function handleAdd() {
    setRecord(undefined);
    setOpen(true);
  }

  function handleEdit(item: BusinessSystem) {
    setRecord(item);
    setOpen(true);
  }

  async function handleDelete(item: BusinessSystem) {
    await onDelete(item.id);
    search.reset();
  }

  async function handleOk(values: { name: string; enabled: boolean }) {
    if (record) {
      await onEdit(record, values);
    } else {
      await onAdd(values);
    }
    setOpen(false);
    search.reset();
  }

  useEffect(() => {
    if (!open) setRecord(undefined);
  }, [open]);

  const columns: ColumnsType<BusinessSystem> = [
    {
      title: '系统名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, item) => (
        <Button type="link" className="p-0!" onClick={() => goToLogs(item)}>
          {name}
        </Button>
      ),
    },
    {
      title: 'App ID',
      dataIndex: 'appId',
      key: 'appId',
      width: 280,
      ellipsis: true,
      render: (appId: string) => (
        <Typography.Text copyable={{ text: appId }}>{appId}</Typography.Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 90,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => formatDate(text),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: unknown, item) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button type="link" onClick={() => goToLogs(item)}>
            查看日志
          </Button>
          <Button type="link" onClick={() => handleEdit(item)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该业务系统吗？" onConfirm={() => handleDelete(item)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Layout.Content className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <BugOutlined className="mr-2" />
              监控异常
            </h1>
            <p className="mt-2">管理业务系统，点击进入查看监控日志</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增业务系统
          </Button>
        </div>

        <Card className="mb-4">
          <Form form={form} layout="inline">
            <Form.Item name="name" label="系统名称">
              <Input placeholder="模糊搜索" allowClear />
            </Form.Item>
            <Form.Item name="appId" label="App ID">
              <Input placeholder="模糊搜索" allowClear />
            </Form.Item>
            <Form.Item name="enabled" label="状态">
              <Select
                allowClear
                placeholder="全部"
                style={{ width: 100 }}
                options={[
                  { label: '启用', value: true },
                  { label: '禁用', value: false },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<SearchOutlined />} onClick={search.submit}>
                搜索
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={search.reset}>重置</Button>
            </Form.Item>
          </Form>
        </Card>

        <Card className="shadow-sm">
          <Table
            columns={columns}
            rowKey="id"
            {...tableProps}
            onRow={(item) => ({
              onClick: () => goToLogs(item),
              style: { cursor: 'pointer' },
            })}
          />
        </Card>

        <EditSystemModal
          open={open}
          record={record}
          loading={loading}
          onOk={handleOk}
          onCancel={() => setOpen(false)}
        />
      </Layout.Content>
    </Layout>
  );
}
