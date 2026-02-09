import { useState, useEffect } from 'react';
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Card,
  Tag,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Content } = Layout;
const { Option } = Select;

// 用户数据类型
interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  roleIds: string[];
  departmentId?: string;
  createTime: string;
  lastLoginTime?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 模拟用户数据
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      name: '管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      status: 'active',
      roleIds: ['1', '2'],
      departmentId: '1',
      createTime: '2024-01-01',
      lastLoginTime: '2024-02-09',
    },
    {
      id: '2',
      username: 'user1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138001',
      status: 'active',
      roleIds: ['2'],
      departmentId: '2',
      createTime: '2024-01-15',
      lastLoginTime: '2024-02-08',
    },
    {
      id: '3',
      username: 'user2',
      name: '李四',
      email: 'lisi@example.com',
      phone: '13800138002',
      status: 'inactive',
      roleIds: ['3'],
      departmentId: '3',
      createTime: '2024-02-01',
    },
  ];

  const mockRoles = [
    { id: '1', name: '超级管理员' },
    { id: '2', name: '管理员' },
    { id: '3', name: '普通用户' },
  ];

  const mockDepartments = [
    { id: '1', name: '技术部' },
    { id: '2', name: '产品部' },
    { id: '3', name: '运营部' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roleIds: user.roleIds,
      departmentId: user.departmentId,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    // 这里应该调用删除API
    setUsers(users.filter((user) => user.id !== id));
    message.success('删除成功');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        // 编辑
        setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, ...values } : user)));
        message.success('编辑成功');
      } else {
        // 新增
        const newUser: User = {
          id: Date.now().toString(),
          ...values,
          createTime: new Date().toISOString().split('T')[0],
        };
        setUsers([...users, newUser]);
        message.success('新增成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns: ColumnsType<User> = [
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 80,
      render: () => <Avatar icon={<UserOutlined />} />,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roleIds',
      key: 'roleIds',
      render: (roleIds: string[]) => (
        <div>
          {roleIds.map((roleId) => {
            const role = mockRoles.find((r) => r.id === roleId);
            return role ? <Tag key={roleId}>{role.name}</Tag> : null;
          })}
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'departmentId',
      key: 'departmentId',
      render: (departmentId: string) => {
        const department = mockDepartments.find((d) => d.id === departmentId);
        return department ? department.name : '-';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      render: (time: string) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除这个用户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-[calc(100vh-64px-70px)]">
      <Content className="p-6 ">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold  flex items-center">
              <UserOutlined className="mr-2" />
              用户管理
            </h1>
            <p className=" mt-2">管理系统用户账号信息</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        </div>

        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
          />
        </Card>

        <Modal
          title={editingUser ? '编辑用户' : '新增用户'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: 'active',
            }}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                disabled={!!editingUser}
              />
            </Form.Item>

            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号"
              rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="active">正常</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="roleIds"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select mode="multiple" placeholder="请选择角色">
                {mockRoles.map((role) => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="departmentId" label="部门">
              <Select placeholder="请选择部门">
                {mockDepartments.map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {!editingUser && (
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
