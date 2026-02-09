import { useState, useEffect } from 'react';
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Card,
  Tag,
  Transfer,
  Divider,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TransferProps } from 'antd';

const { Content } = Layout;

// 角色数据类型
interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  permissionIds: string[];
  createTime: string;
  updateTime: string;
}

// 权限数据类型
interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: string;
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<React.Key[]>([]);

  // 模拟角色数据
  const mockRoles: Role[] = [
    {
      id: '1',
      name: '超级管理员',
      code: 'super_admin',
      description: '拥有系统所有权限',
      status: 'active',
      permissionIds: ['1', '2', '3', '4', '5'],
      createTime: '2024-01-01',
      updateTime: '2024-02-09',
    },
    {
      id: '2',
      name: '管理员',
      code: 'admin',
      description: '拥有大部分管理权限',
      status: 'active',
      permissionIds: ['2', '3', '4'],
      createTime: '2024-01-01',
      updateTime: '2024-02-08',
    },
    {
      id: '3',
      name: '普通用户',
      code: 'user',
      description: '基本用户权限',
      status: 'active',
      permissionIds: ['3'],
      createTime: '2024-01-15',
      updateTime: '2024-02-01',
    },
  ];

  // 模拟权限数据
  const mockPermissions: Permission[] = [
    { id: '1', name: '系统管理', code: 'system:manage', type: 'menu' },
    { id: '2', name: '用户管理', code: 'user:manage', type: 'menu' },
    { id: '3', name: '问卷管理', code: 'question:manage', type: 'menu' },
    { id: '4', name: '数据统计', code: 'stat:view', type: 'menu' },
    { id: '5', name: '系统设置', code: 'system:config', type: 'menu' },
    { id: '6', name: '用户新增', code: 'user:create', type: 'button', parentId: '2' },
    { id: '7', name: '用户编辑', code: 'user:update', type: 'button', parentId: '2' },
    { id: '8', name: '用户删除', code: 'user:delete', type: 'button', parentId: '2' },
    { id: '9', name: '问卷创建', code: 'question:create', type: 'button', parentId: '3' },
    { id: '10', name: '问卷编辑', code: 'question:update', type: 'button', parentId: '3' },
  ];

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setRoles(mockRoles);
      setLoading(false);
    }, 500);
  };

  const fetchPermissions = async () => {
    // 模拟API调用
    setTimeout(() => {
      setPermissions(mockPermissions);
    }, 300);
  };

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setSelectedPermissions([]);
    form.setFieldsValue({ status: 'active' });
    setIsModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      code: role.code,
      description: role.description,
      status: role.status,
    });
    setSelectedPermissions(role.permissionIds);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    // 这里应该调用删除API
    setRoles(roles.filter((role) => role.id !== id));
    message.success('删除成功');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        // 编辑
        setRoles(
          roles.map((role) =>
            role.id === editingRole.id
              ? {
                  ...role,
                  ...values,
                  permissionIds: selectedPermissions,
                  updateTime: new Date().toISOString().split('T')[0],
                }
              : role
          )
        );
        message.success('编辑成功');
      } else {
        // 新增
        const newRole: Role = {
          id: Date.now().toString(),
          ...values,
          permissionIds: selectedPermissions,
          createTime: new Date().toISOString().split('T')[0],
          updateTime: new Date().toISOString().split('T')[0],
        };
        setRoles([...roles, newRole]);
        message.success('新增成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      setSelectedPermissions([]);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedPermissions([]);
  };

  const handlePermissionChange: TransferProps['onChange'] = (newTargetKeys) => {
    setSelectedPermissions(newTargetKeys);
  };

  const columns: ColumnsType<Role> = [
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
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '权限数量',
      dataIndex: 'permissionIds',
      key: 'permissionIds',
      render: (permissionIds: string[]) => permissionIds.length,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
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
          <Popconfirm title="确定删除这个角色吗？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transferData = permissions.map((perm) => ({
    key: perm.id,
    title: `${perm.name} (${perm.code})`,
    description: perm.type,
  }));

  return (
    <Layout className="min-h-[calc(100vh-64px-70px)]">
      <Content className="p-6 ">
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

        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={roles}
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
          title={editingRole ? '编辑角色' : '新增角色'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: 'active',
            }}
          >
            <Form.Item
              name="name"
              label="角色名称"
              rules={[{ required: true, message: '请输入角色名称' }]}
            >
              <Input placeholder="请输入角色名称" />
            </Form.Item>

            <Form.Item
              name="code"
              label="角色编码"
              rules={[
                { required: true, message: '请输入角色编码' },
                { pattern: /^[a-z_]+$/, message: '角色编码只能包含小写字母和下划线' },
              ]}
            >
              <Input placeholder="请输入角色编码" disabled={!!editingRole} />
            </Form.Item>

            <Form.Item name="description" label="描述">
              <Input.TextArea placeholder="请输入角色描述" rows={3} />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Space>
                <span>启用</span>
                <Form.Item name="status" noStyle>
                  <Input type="checkbox" />
                </Form.Item>
              </Space>
            </Form.Item>

            <Divider>权限分配</Divider>

            <Form.Item label="选择权限">
              <Transfer
                dataSource={transferData}
                titles={['可选权限', '已选权限']}
                targetKeys={selectedPermissions}
                onChange={handlePermissionChange}
                render={(item) => `${item.title} - ${item.description}`}
                listStyle={{
                  width: 300,
                  height: 300,
                }}
                showSearch
                filterOption={(inputValue, option) =>
                  option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
