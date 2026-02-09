import { Layout, Card, Row, Col } from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  TeamOutlined,
  ApartmentOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';

const { Content } = Layout;

export default function SystemManagement() {
  const navigate = useNavigate();

  const managementItems = [
    {
      title: '菜单管理',
      icon: <MenuOutlined className="text-2xl text-blue-600" />,
      description: '管理系统菜单结构',
      path: '/admin/menu',
    },
    {
      title: '用户管理',
      icon: <UserOutlined className="text-2xl text-green-600" />,
      description: '管理系统用户账号',
      path: '/admin/user',
    },
    {
      title: '角色管理',
      icon: <TeamOutlined className="text-2xl text-purple-600" />,
      description: '管理系统角色权限',
      path: '/admin/role',
    },
    {
      title: '部门管理',
      icon: <ApartmentOutlined className="text-2xl text-orange-600" />,
      description: '管理系统组织架构',
      path: '/admin/department',
    },
    {
      title: '字典管理',
      icon: <BookOutlined className="text-2xl text-red-600" />,
      description: '管理系统字典数据',
      path: '/admin/dictionary',
    },
  ];

  return (
    <Layout className="min-h-[calc(100vh-64px-70px)]">
      <Content className="p-6 ">
        <div className="mb-6">
          <h1 className="text-2xl font-bold ">系统管理</h1>
          <p className=" mt-2">管理系统的基础数据和组织架构</p>
        </div>

        <Row gutter={[16, 16]}>
          {managementItems.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.path}>
              <Card
                hoverable
                className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => navigate(item.path)}
              >
                <div className="text-center">
                  <div className="mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className=" text-sm">{item.description}</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
}
