import { useEffect, useMemo, useState } from 'react';
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
import { EditOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/date.util';
import LazyDepartmentTreeSelect from './components/LazyDepartmentTreeSelect';
import {
  createUser,
  getDepartments,
  getRoles,
  getUsers,
  removeUser,
  updateUser,
  type Department,
  type Role,
  type Status,
  type User,
  type UserQuery,
} from './api';

const { Content } = Layout;

const statusOptions: { label: string; value: Status }[] = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

interface UserFormValues {
  userName: string;
  displayName: string;
  password?: string;
  deptIds?: number[];
  roleIds?: number[];
  status: Status;
}

export default function UserManagement() {
  const { message } = App.useApp();
  const [query, setQuery] = useState<UserQuery>({ page: 1, pageSize: 20 });
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User>();
  const [searchForm] = Form.useForm<UserQuery>();
  const [form] = Form.useForm<UserFormValues>();

  const roleNameMap = useMemo(
    () => new Map(roles.map((role) => [role.id, role.roleName])),
    [roles]
  );
  const departmentNameMap = useMemo(
    () => new Map(departments.map((department) => [department.id, department.deptName])),
    [departments]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    getUsers(query)
      .then((response) => {
        if (!active) return;
        setUsers(response.data.items);
        setTotal(response.data.total);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    let active = true;
    setOptionsLoading(true);
    Promise.all([
      getRoles({ page: 1, pageSize: 100, status: 1 }),
      getDepartments({ page: 1, pageSize: 100, status: 1 }),
    ])
      .then(([roleResponse, departmentResponse]) => {
        if (!active) return;
        setRoles(roleResponse.data.items);
        setDepartments(departmentResponse.data.items);
      })
      .finally(() => {
        if (active) setOptionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    setEditingUser(undefined);
    form.resetFields();
    form.setFieldsValue({ status: 1, deptIds: [], roleIds: [] });
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    form.setFieldsValue({
      userName: user.userName,
      displayName: user.displayName,
      deptIds: user.deptIds,
      roleIds: user.roleIds,
      status: user.status,
      password: undefined,
    });
    setModalOpen(true);
  }

  async function saveUser(values: UserFormValues) {
    if (editingUser) {
      const payload = {
        displayName: values.displayName,
        deptIds: values.deptIds ?? [],
        roleIds: values.roleIds ?? [],
        status: values.status,
        ...(values.password?.trim() ? { password: values.password } : {}),
      };
      await updateUser(editingUser.id, payload);
      message.success('用户更新成功');
    } else {
      await createUser({
        userName: values.userName,
        displayName: values.displayName,
        password: values.password ?? '',
        deptIds: values.deptIds ?? [],
        roleIds: values.roleIds ?? [],
        status: values.status,
      });
      message.success('用户创建成功');
    }
    setModalOpen(false);
    setQuery((current) => ({ ...current, page: 1 }));
  }

  async function handleRemove(user: User) {
    await removeUser(user.id);
    message.success('用户已删除');
    setQuery((current) => ({ ...current, page: 1 }));
  }

  function submitSearch(values: Partial<UserQuery>) {
    setQuery({
      page: 1,
      pageSize: query.pageSize,
      ...(values.userName ? { userName: values.userName.trim() } : {}),
      ...(values.displayName ? { displayName: values.displayName.trim() } : {}),
      ...(values.deptId !== undefined ? { deptId: values.deptId } : {}),
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
            <UserOutlined className="mr-2" />
            用户管理
          </Typography.Title>
          <Typography.Text type="secondary">维护用户账号、部门、角色和启停状态</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增用户
        </Button>
      </div>

      <Card className="!mb-0">
        <Form form={searchForm} layout="inline" onFinish={submitSearch}>
          <Form.Item name="userName" label="用户账号">
            <Input allowClear placeholder="模糊搜索" />
          </Form.Item>
          <Form.Item name="displayName" label="显示名称">
            <Input allowClear placeholder="模糊搜索" />
          </Form.Item>
          <Form.Item name="deptId" label="部门">
            <LazyDepartmentTreeSelect
              initialItems={departments}
              status={1}
              placeholder="请选择部门"
            />
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
        <Table<User>
          rowKey="id"
          loading={loading}
          dataSource={users}
          columns={[
            { title: '用户账号', dataIndex: 'userName', key: 'userName' },
            { title: '显示名称', dataIndex: 'displayName', key: 'displayName' },
            {
              title: '部门',
              key: 'departments',
              render: (_: unknown, user: User) =>
                user.deptIds.length
                  ? user.deptIds.map((id) => departmentNameMap.get(id) ?? `#${id}`).join('、')
                  : '-',
            },
            {
              title: '角色',
              key: 'roles',
              render: (_: unknown, user: User) =>
                user.roleIds.length
                  ? user.roleIds.map((id) => roleNameMap.get(id) ?? `#${id}`).join('、')
                  : '-',
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              render: (status: Status) => (
                <Tag color={status === 1 ? 'success' : 'default'}>
                  {status === 1 ? '启用' : '停用'}
                </Tag>
              ),
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
              render: (_: unknown, user: User) => (
                <Space>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(user)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="确认软删除此用户？"
                    description="删除后会同时解除用户的部门和角色关联。"
                    onConfirm={() => handleRemove(user)}
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
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form<UserFormValues>
          form={form}
          layout="vertical"
          onFinish={saveUser}
          initialValues={{ status: 1, deptIds: [], roleIds: [] }}
        >
          <Form.Item
            name="userName"
            label="用户账号"
            rules={[
              { required: true, message: '请输入用户账号' },
              { max: 100, message: '用户账号不能超过100个字符' },
              { pattern: /^[A-Za-z0-9_]+$/, message: '只能包含字母、数字和下划线' },
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }, { max: 100 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingUser ? '新密码（留空不修改）' : '登录密码'}
            rules={[
              ...(editingUser ? [] : [{ required: true, message: '请输入登录密码' }]),
              { min: 8, message: '密码长度不能少于8位' },
              { max: 128, message: '密码长度不能超过128位' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="deptIds" label="所属部门">
            <LazyDepartmentTreeSelect multiple initialItems={departments} status={1} />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Select
              mode="multiple"
              loading={optionsLoading}
              options={roles.map((role) => ({ label: role.roleName, value: role.id }))}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}
