import { useState, useEffect } from 'react';
import { Layout, Tree, Button, Modal, Form, Input, Space, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

const { Content } = Layout;

// 菜单数据类型
interface MenuItem {
  id: string;
  title: string;
  key: string;
  parentId?: string;
  path?: string;
  icon?: string;
  sort: number;
  children?: MenuItem[];
}

export default function MenuManagement() {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();

  // 模拟菜单数据
  const mockMenuData: MenuItem[] = [
    {
      id: '1',
      title: '系统管理',
      key: 'system',
      path: '/admin',
      icon: 'SettingOutlined',
      sort: 1,
      children: [
        {
          id: '1-1',
          title: '菜单管理',
          key: 'menu',
          path: '/admin/menu',
          icon: 'MenuOutlined',
          sort: 1,
          parentId: '1',
        },
        {
          id: '1-2',
          title: '用户管理',
          key: 'user',
          path: '/admin/user',
          icon: 'UserOutlined',
          sort: 2,
          parentId: '1',
        },
        {
          id: '1-3',
          title: '角色管理',
          key: 'role',
          path: '/admin/role',
          icon: 'TeamOutlined',
          sort: 3,
          parentId: '1',
        },
      ],
    },
    {
      id: '2',
      title: '问卷管理',
      key: 'question',
      path: '/manage',
      icon: 'FileTextOutlined',
      sort: 2,
      children: [
        {
          id: '2-1',
          title: '我的问卷',
          key: 'my-question',
          path: '/manage',
          icon: 'UnorderedListOutlined',
          sort: 1,
          parentId: '2',
        },
        {
          id: '2-2',
          title: '星标问卷',
          key: 'star-question',
          path: '/manage/star',
          icon: 'StarOutlined',
          sort: 2,
          parentId: '2',
        },
      ],
    },
  ];

  // 转换菜单数据为Tree组件格式
  const convertToTreeData = (menus: MenuItem[]): DataNode[] => {
    return menus.map((menu) => ({
      title: (
        <div className="flex items-center justify-between w-full pr-4">
          <span>{menu.title}</span>
          <Space size="small">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd(menu.id);
              }}
            />
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(menu);
              }}
            />
            <Popconfirm
              title="确定删除这个菜单吗？"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(menu.id);
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
      key: menu.id,
      children: menu.children ? convertToTreeData(menu.children) : [],
    }));
  };

  useEffect(() => {
    setTreeData(convertToTreeData(mockMenuData));
  }, []);

  const handleAdd = (parentId?: string) => {
    setEditingMenu(null);
    form.resetFields();
    if (parentId) {
      form.setFieldsValue({ parentId });
    }
    setIsModalVisible(true);
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    form.setFieldsValue({
      title: menu.title,
      key: menu.key,
      path: menu.path,
      icon: menu.icon,
      sort: menu.sort,
      parentId: menu.parentId,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (_id: string) => {
    // 这里应该调用删除API
    message.success('删除成功');
    // 刷新数据
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingMenu) {
        // 编辑
        console.log('编辑菜单:', values);
        message.success('编辑成功');
      } else {
        // 新增
        console.log('新增菜单:', values);
        message.success('新增成功');
      }
      setIsModalVisible(false);
      // 刷新数据
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <Layout className="min-h-[calc(100vh-64px-70px)]">
      <Content className="p-6 ">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold  flex items-center">
              <MenuOutlined className="mr-2" />
              菜单管理
            </h1>
            <p className=" mt-2">管理系统菜单结构，支持树形组织</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
            新增根菜单
          </Button>
        </div>

        <Card className="shadow-sm">
          <Tree treeData={treeData} defaultExpandAll showLine className="custom-tree" />
        </Card>

        <Modal
          title={editingMenu ? '编辑菜单' : '新增菜单'}
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
            }}
          >
            <Form.Item
              name="title"
              label="菜单名称"
              rules={[{ required: true, message: '请输入菜单名称' }]}
            >
              <Input placeholder="请输入菜单名称" />
            </Form.Item>

            <Form.Item
              name="key"
              label="菜单标识"
              rules={[{ required: true, message: '请输入菜单标识' }]}
            >
              <Input placeholder="请输入菜单标识" />
            </Form.Item>

            <Form.Item name="path" label="路由路径">
              <Input placeholder="请输入路由路径" />
            </Form.Item>

            <Form.Item name="icon" label="图标">
              <Input placeholder="请输入图标名称" />
            </Form.Item>

            <Form.Item name="sort" label="排序">
              <Input type="number" placeholder="请输入排序号" />
            </Form.Item>

            <Form.Item name="parentId" label="父级菜单" hidden={!editingMenu}>
              <Input disabled />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
