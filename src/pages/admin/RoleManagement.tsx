import { useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/date.util';
import {
  createRole,
  getRoles,
  removeRole,
  updateRole,
  type DataScope,
  type Role,
  type RoleQuery,
  type Status,
} from './api';

const { Content } = Layout;

const dataScopeOptions: { label: string; value: DataScope }[] = [
  { label: '全部数据', value: 'all' },
  { label: '自定义数据', value: 'custom' },
  { label: '本部门数据', value: 'department' },
  { label: '本部门及下属', value: 'department_and_children' },
  { label: '仅本人数据', value: 'self' },
  { label: '无数据权限', value: 'none' },
];

const statusOptions: { label: string; value: Status }[] = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

interface RoleFormValues {
  roleName: string;
  roleCode: string;
  dataScope: DataScope;
  status: Status;
  remark?: string;
}

function statusTag(status: Status) {
  return <Tag color={status === 1 ? 'success' : 'default'}>{status === 1 ? '启用' : '停用'}</Tag>;
}

export default function RoleManagement() {
  const { message } = App.useApp();
  const [query, setQuery] = useState<RoleQuery>({ page: 1, pageSize: 20 });
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role>();
  const [searchForm] = Form.useForm<RoleQuery>();
  const [form] = Form.useForm<RoleFormValues>();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getRoles(query)
      .then((response) => {
        if (!active) return;
        setRoles(response.data.items);
        setTotal(response.data.total);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  function openCreate() {
    setEditingRole(undefined);
    form.resetFields();
    form.setFieldsValue({ dataScope: 'all', status: 1 });
    setModalOpen(true);
  }

  function openEdit(role: Role) {
    setEditingRole(role);
    form.setFieldsValue({
      roleName: role.roleName,
      roleCode: role.roleCode,
      dataScope: role.dataScope,
      status: role.status,
      remark: role.remark ?? undefined,
    });
    setModalOpen(true);
  }

  async function saveRole(values: RoleFormValues) {
    const payload = {
      roleName: values.roleName,
      dataScope: values.dataScope,
      status: values.status,
      remark: values.remark?.trim() || null,
    };

    if (editingRole) {
      await updateRole(editingRole.id, payload);
      message.success('角色更新成功');
    } else {
      await createRole({ ...payload, roleCode: values.roleCode });
      message.success('角色创建成功');
    }
    setModalOpen(false);
    setQuery((current) => ({ ...current, page: 1 }));
  }

  async function handleRemove(role: Role) {
    await removeRole(role.id);
    message.success('角色已删除');
    setQuery((current) => ({ ...current, page: 1 }));
  }

  function submitSearch(values: Partial<RoleQuery>) {
    setQuery({
      page: 1,
      pageSize: query.pageSize,
      ...(values.roleName ? { roleName: values.roleName.trim() } : {}),
      ...(values.roleCode ? { roleCode: values.roleCode.trim() } : {}),
      ...(values.dataScope ? { dataScope: values.dataScope } : {}),
      ...(values.status !== undefined ? { status: values.status } : {}),
    });
  }

  function resetSearch() {
    searchForm.resetFields();
    setQuery({ page: 1, pageSize: query.pageSize });
  }

  return (
    <Content className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Typography.Title level={2} className="!mb-1">
            <TeamOutlined className="mr-2" />
            角色管理
          </Typography.Title>
          <Typography.Text type="secondary">管理角色编码、数据范围和启停状态</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增角色
        </Button>
      </div>

      <Card className="!mb-0">
        <Form form={searchForm} layout="inline" onFinish={submitSearch}>
          <Form.Item name="roleName" label="角色名称">
            <Input allowClear placeholder="模糊搜索" />
          </Form.Item>
          <Form.Item name="roleCode" label="角色编码">
            <Input allowClear placeholder="模糊搜索" />
          </Form.Item>
          <Form.Item name="dataScope" label="数据范围">
            <Select allowClear options={dataScopeOptions} className="min-w-44" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select allowClear options={statusOptions} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={resetSearch}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="mt-4!">
        <Table<Role>
          rowKey="id"
          loading={loading}
          dataSource={roles}
          columns={[
            { title: '角色名称', dataIndex: 'roleName', key: 'roleName' },
            {
              title: '角色编码',
              dataIndex: 'roleCode',
              key: 'roleCode',
              render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
            },
            {
              title: '数据范围',
              dataIndex: 'dataScope',
              key: 'dataScope',
              render: (value: DataScope) =>
                dataScopeOptions.find((option) => option.value === value)?.label ?? value,
            },
            { title: '状态', dataIndex: 'status', key: 'status', render: statusTag },
            {
              title: '备注',
              dataIndex: 'remark',
              key: 'remark',
              ellipsis: true,
              render: (value: string | null) => value || '-',
            },
            {
              title: '更新时间',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              render: (value: string) => formatDate(value),
            },
            {
              title: '操作',
              key: 'actions',
              width: 150,
              render: (_: unknown, role: Role) => (
                <Space>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(role)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="确认软删除此角色？"
                    description="删除后无法通过当前接口恢复。"
                    onConfirm={() => handleRemove(role)}
                  >
                    <Button type="link" danger>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (page, pageSize) => setQuery((current) => ({ ...current, page, pageSize })),
          }}
        />
      </Card>

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form<RoleFormValues>
          form={form}
          layout="vertical"
          onFinish={saveRole}
          initialValues={{ dataScope: 'all', status: 1 }}
        >
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }, { max: 100 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="roleCode"
            label="角色编码"
            rules={[
              { required: true, message: '请输入角色编码' },
              { max: 100, message: '角色编码不能超过100个字符' },
              { pattern: /^[A-Za-z0-9_]+$/, message: '只能包含字母、数字和下划线' },
            ]}
          >
            <Input disabled={!!editingRole} />
          </Form.Item>
          <Form.Item name="dataScope" label="数据范围">
            <Select options={dataScopeOptions} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}
