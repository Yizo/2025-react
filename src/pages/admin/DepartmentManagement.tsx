import { useState, useEffect } from 'react';
import {
  Layout,
  Tree,
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
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

const { Content } = Layout;
const { Option } = Select;

// 部门数据类型
interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  leader?: string;
  leaderId?: string;
  sort: number;
  status: 'active' | 'inactive';
  children?: Department[];
  userCount?: number;
  createTime: string;
}

export default function DepartmentManagement() {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();

  // 模拟部门数据
  const mockDepartments: Department[] = [
    {
      id: '1',
      name: '总公司',
      code: 'company',
      description: '公司总部',
      sort: 1,
      status: 'active',
      leader: '张总',
      leaderId: '1',
      userCount: 50,
      createTime: '2024-01-01',
      children: [
        {
          id: '1-1',
          name: '技术部',
          code: 'tech',
          description: '负责技术开发',
          parentId: '1',
          sort: 1,
          status: 'active',
          leader: '李工',
          leaderId: '2',
          userCount: 20,
          createTime: '2024-01-01',
          children: [
            {
              id: '1-1-1',
              name: '前端组',
              code: 'frontend',
              description: '前端开发团队',
              parentId: '1-1',
              sort: 1,
              status: 'active',
              leader: '王前',
              leaderId: '3',
              userCount: 8,
              createTime: '2024-01-15',
            },
            {
              id: '1-1-2',
              name: '后端组',
              code: 'backend',
              description: '后端开发团队',
              parentId: '1-1',
              sort: 2,
              status: 'active',
              leader: '赵后',
              leaderId: '4',
              userCount: 12,
              createTime: '2024-01-15',
            },
          ],
        },
        {
          id: '1-2',
          name: '产品部',
          code: 'product',
          description: '负责产品设计',
          parentId: '1',
          sort: 2,
          status: 'active',
          leader: '刘产',
          leaderId: '5',
          userCount: 15,
          createTime: '2024-01-01',
        },
        {
          id: '1-3',
          name: '运营部',
          code: 'operation',
          description: '负责运营推广',
          parentId: '1',
          sort: 3,
          status: 'active',
          leader: '陈运',
          leaderId: '6',
          userCount: 15,
          createTime: '2024-01-01',
        },
      ],
    },
  ];

  // 模拟用户数据（用于选择负责人）
  const mockUsers = [
    { id: '1', name: '张总' },
    { id: '2', name: '李工' },
    { id: '3', name: '王前' },
    { id: '4', name: '赵后' },
    { id: '5', name: '刘产' },
    { id: '6', name: '陈运' },
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    // 模拟API调用
    setTimeout(() => {
      setDepartments(mockDepartments);
      setTreeData(convertToTreeData(mockDepartments));
    }, 500);
  };

  // 转换部门数据为Tree组件格式
  const convertToTreeData = (depts: Department[]): DataNode[] => {
    return depts.map((dept) => ({
      title: (
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center space-x-3">
            <Avatar size="small" icon={<ApartmentOutlined />} />
            <div>
              <div className="font-medium">{dept.name}</div>
              <div className="text-xs  flex items-center space-x-2">
                <span>{dept.description}</span>
                {dept.leader && (
                  <span className="flex items-center">
                    <UserOutlined className="mr-1" />
                    {dept.leader}
                  </span>
                )}
                <Tag color={dept.status === 'active' ? 'green' : 'red'}>
                  {dept.status === 'active' ? '正常' : '禁用'}
                </Tag>
                <span className="flex items-center">
                  <TeamOutlined className="mr-1" />
                  {dept.userCount || 0}人
                </span>
              </div>
            </div>
          </div>
          <Space size="small">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd(dept.id);
              }}
            />
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(dept);
              }}
            />
            <Popconfirm
              title="确定删除这个部门吗？"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(dept.id);
              }}
              onCancel={(e) => e?.stopPropagation()}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Space>
        </div>
      ),
      key: dept.id,
      children: dept.children ? convertToTreeData(dept.children) : [],
    }));
  };

  const handleAdd = (parentId?: string) => {
    setEditingDepartment(null);
    form.resetFields();
    if (parentId) {
      form.setFieldsValue({ parentId });
    }
    form.setFieldsValue({ status: 'active', sort: 1 });
    setIsModalVisible(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue({
      name: department.name,
      code: department.code,
      description: department.description,
      parentId: department.parentId,
      leaderId: department.leaderId,
      sort: department.sort,
      status: department.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (_id: string) => {
    // 这里应该调用删除API
    message.success('删除成功');
    // 刷新数据
    fetchDepartments();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const leader = mockUsers.find((user) => user.id === values.leaderId);

      if (editingDepartment) {
        // 编辑
        console.log('编辑部门:', { ...values, leader: leader?.name });
        message.success('编辑成功');
      } else {
        // 新增
        console.log('新增部门:', { ...values, leader: leader?.name });
        message.success('新增成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      // 刷新数据
      fetchDepartments();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 计算总人数
  const getTotalUserCount = (depts: Department[]): number => {
    return depts.reduce((total, dept) => {
      return total + (dept.userCount || 0) + (dept.children ? getTotalUserCount(dept.children) : 0);
    }, 0);
  };

  const totalUserCount = getTotalUserCount(departments);
  const totalDepartments =
    departments.length +
    departments.reduce((total, dept) => {
      return (
        total +
        (dept.children
          ? dept.children.length +
            dept.children.reduce((subTotal, subDept) => {
              return subTotal + (subDept.children ? subDept.children.length : 0);
            }, 0)
          : 0)
      );
    }, 0);

  return (
    <Layout className="min-h-[calc(100vh-64px-70px)]">
      <Content className="p-6 ">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <ApartmentOutlined className="mr-2" />
            部门管理
          </h1>
          <p className="mt-2">管理系统组织架构，支持树形结构</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <Statistic
              title="总部门数"
              value={totalDepartments}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
          <Card>
            <Statistic
              title="总人数"
              value={totalUserCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card>
            <Statistic
              title="活跃部门"
              value={totalDepartments}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div></div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
            新增根部门
          </Button>
        </div>

        <Card className="shadow-sm">
          <Tree treeData={treeData} defaultExpandAll showLine className="custom-tree" />
        </Card>

        <Modal
          title={editingDepartment ? '编辑部门' : '新增部门'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              sort: 1,
              status: 'active',
            }}
          >
            <Form.Item
              name="name"
              label="部门名称"
              rules={[{ required: true, message: '请输入部门名称' }]}
            >
              <Input placeholder="请输入部门名称" />
            </Form.Item>

            <Form.Item
              name="code"
              label="部门编码"
              rules={[
                { required: true, message: '请输入部门编码' },
                { pattern: /^[a-z_]+$/, message: '部门编码只能包含小写字母和下划线' },
              ]}
            >
              <Input placeholder="请输入部门编码" disabled={!!editingDepartment} />
            </Form.Item>

            <Form.Item name="description" label="部门描述">
              <Input.TextArea placeholder="请输入部门描述" rows={3} />
            </Form.Item>

            <Form.Item name="leaderId" label="负责人">
              <Select placeholder="请选择负责人">
                {mockUsers.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="sort" label="排序">
              <Input type="number" placeholder="请输入排序号" />
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

            <Form.Item name="parentId" label="上级部门" hidden={!editingDepartment}>
              <Input disabled />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
