import { getRoleList } from './api';
import { EditRoleModal } from './edit-role';
import { useRoleManagement } from './use-role-management';
import type { ColumnsType } from 'antd/es/table';

function useSearch() {
  const [form] = Form.useForm();
  const { tableProps, search } = useAntdTable(getTableData, {
    form,
    defaultParams: [
      {
        current: 1,
        pageSize: 10,
        total: 0,
      },
    ],
  });
  Object.assign(tableProps, {
    pagination: {
      ...tableProps.pagination,
      ...tableConfig.pagination,
    },
  });

  function getTableData(...args: Record<string, any>[]) {
    const [pagination, formData] = args;
    const { current, pageSize } = pagination;
    const queryParams = {
      page: current,
      pageSize,
      ...formData,
    };
    return getRoleList(queryParams).then((res) => {
      return {
        list: res.data,
        total: res.total,
      };
    });
  }
  return {
    form,
    tableProps,
    search,
  };
}

export default function RoleList() {
  const { form, tableProps, search } = useSearch();
  const { open, setOpen, loading, onDeleteRole, onEditRole, onAddRole } = useRoleManagement();
  const [record, setRecord] = useState<any>();

  function handleAdd() {
    setOpen(true);
  }

  async function handleEditRole(item: any) {
    setRecord(item);
    setOpen(true);
  }

  async function handleDeleteRole(item: any) {
    await onDeleteRole(item.id);
    handleOperationSuccess();
  }

  async function handleEditRoleOK(values: any) {
    if (record) {
      await onEditRole({
        id: record.id,
        name: values.name,
        code: values.code,
        description: values.description,
      });
    } else {
      await onAddRole(values);
    }
    handleOperationSuccess();
  }

  function handleOperationSuccess() {
    setOpen(false);
    search.reset();
  }

  useEffect(() => {
    if (!open) {
      setRecord(undefined);
    }
  }, [open]);

  const columns: ColumnsType<any> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate line-clamp-2 max-w-[300px]">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => formatDate(text),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, item: any) => (
        <Space>
          <Popconfirm title="确定删除这个角色吗？" onConfirm={() => handleDeleteRole(item)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
          <Button type="link" onClick={() => handleEditRole(item)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Layout.Content className="p-6 ">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold  flex items-center">
              <TeamOutlined className="mr-2" />
              角色管理
            </h1>
            <p className=" mt-2">管理系统角色及权限分配</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
        </div>

        <Card>
          <Form form={form} layout="inline">
            <Form.Item name="name" label="角色名称">
              <Input />
            </Form.Item>

            <Form.Item name="code" label="角色编码">
              <Input />
            </Form.Item>

            <Form.Item name="description" label="描述">
              <Input />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                onClick={search.submit}
              >
                搜索
              </Button>
            </Form.Item>

            <Form.Item>
              <Button onClick={search.reset}>重置</Button>
            </Form.Item>
          </Form>
        </Card>

        <Card className="shadow-sm mt-2!">
          <Table columns={columns} rowKey="id" {...tableProps} />
        </Card>
      </Layout.Content>
      <EditRoleModal
        open={open}
        record={record}
        loading={loading}
        onOk={handleEditRoleOK}
        onCancel={() => setOpen(false)}
      />
    </Layout>
  );
}
