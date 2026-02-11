import { getRoleList } from './api';
import { EditRoleModal, RoleManagement } from './edit-role';

function useSearchForm() {
  const [form] = Form.useForm();

  const SearchForm = ({ onSearch, onReset }: { onSearch: () => void; onReset: () => void }) => {
    return (
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
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />} onClick={onSearch}>
            搜索
          </Button>
        </Form.Item>

        <Form.Item>
          <Button onClick={onReset}>重置</Button>
        </Form.Item>
      </Form>
    );
  };

  return {
    SearchForm,
    form,
  };
}

export default function RoleList() {
  const { SearchForm, form } = useSearchForm();

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

  const columns = [
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
      render: (text: string) => {
        return (
          <Tooltip title={text}>
            <span className="truncate line-clamp-2 max-w-[300px]">{text}</span>
          </Tooltip>
        );
      },
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
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm title="确定删除这个角色吗？" onConfirm={() => handleDeleteRole(record)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
          <Button type="link" onClick={() => handleEditRole(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const { open, setOpen, onDeleteRole, onEditRole, onAddRole } = RoleManagement({
    success: search.reset,
  });
  const [record, setRecord] = useState<any>();
  function handleAdd() {
    setOpen(true);
  }
  function handleDeleteRole(record: any) {
    onDeleteRole(record.id);
  }
  function handleEditRole(record: any) {
    setRecord(record);
    setOpen(true);
  }
  function handleEditRoleOK(values: any) {
    if (record) {
      onEditRole(values);
    } else {
      onAddRole(values);
    }
  }
  function handleEditRoleCancel() {
    setRecord(undefined);
    setOpen(false);
    search.reset();
  }

  return (
    <Layout className="min-h-[calc(100vh-64px-70px)]">
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
          <SearchForm onSearch={search.submit} onReset={search.reset} />
        </Card>
        <Card className="shadow-sm mt-2!">
          <Table columns={columns} rowKey="id" {...tableProps} />
        </Card>
      </Layout.Content>
      <EditRoleModal open={open} onOk={handleEditRoleOK} onCancel={handleEditRoleCancel} />
    </Layout>
  );
}
