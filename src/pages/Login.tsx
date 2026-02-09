import { Form, Input, Button, Card, Typography, Space, Divider, App } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useLogin } from '@/store/user';
import { useNavigate, Link } from 'react-router';
import { ADMIN_PATH } from '@/router/constant';

const { Title, Text } = Typography;
const { Item, useForm } = Form;

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
};

export default function Login() {
  const [form] = useForm();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { onLogin, loading: _loading } = useLogin();
  const themeColor = import.meta.env.VITE_THEME;

  async function onFinish(values: any) {
    try {
      if (_loading) return;
      await onLogin(values);
      message.success('登录成功');
      setTimeout(() => {
        navigate(ADMIN_PATH);
      }, 1000);
    } catch (err) {
      console.log('登录失败:', err);
    }
  }

  function onReset() {
    form.resetFields();
  }

  // 创建基于主题色的渐变颜色
  const lighterColor = themeColor.replace('#', '');
  const r = parseInt(lighterColor.substr(0, 2), 16);
  const g = parseInt(lighterColor.substr(2, 2), 16);
  const b = parseInt(lighterColor.substr(4, 2), 16);
  const lighterShade = `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)}, 0.1)`;
  const darkerShade = `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 0.05)`;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${lighterShade} 0%, rgba(255, 255, 255, 0.8) 50%, ${darkerShade} 100%)`,
      }}
    >
      <div className="w-full max-w-md">
        {/* 头部区域 */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${lighterColor})`,
              boxShadow: `0 4px 20px rgba(${r}, ${g}, ${b}, 0.3)`,
            }}
          >
            <UserOutlined className="text-2xl text-white" />
          </div>
          <Title level={2} className="!text-gray-800 !mb-2 !font-bold">
            欢迎回来
          </Title>
          <Text className="text-gray-600">请登录您的账户</Text>
        </div>

        {/* 登录表单卡片 */}
        <Card
          className="shadow-xl border-0"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
          }}
        >
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="space-y-4"
          >
            {/* 用户名 */}
            <Item name="username" initialValue={'superAdmin'} rules={rules.username}>
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="请输入用户名"
                className="rounded-lg"
              />
            </Item>

            {/* 密码 */}
            <Item name="password" initialValue={'123456'} rules={rules.password}>
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                className="rounded-lg"
              />
            </Item>

            {/* 按钮区域 */}
            <Item className="mb-0">
              <Space direction="vertical" className="w-full">
                <Button
                  loading={_loading}
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}, ${lighterColor})`,
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.3)`,
                  }}
                  className="hover:opacity-90"
                >
                  登录
                </Button>
                <Button
                  disabled={_loading}
                  block
                  size="large"
                  onClick={onReset}
                  className="rounded-lg font-medium border-gray-300 hover:border-gray-400"
                >
                  重置
                </Button>
              </Space>
            </Item>
          </Form>

          {/* 分割线 */}
          <Divider className="!my-6">
            <Text className="text-gray-500">还没有账户？</Text>
          </Divider>

          {/* 注册链接 */}
          <div className="text-center">
            <Link to="/register" className="font-medium transition-colors duration-200">
              立即注册
            </Link>
          </div>
        </Card>

        {/* 底部提示 */}
        <div className="text-center mt-6">
          <Text className="text-gray-500 text-sm">
            登录遇到问题？
            <a href="#" className="">
              联系客服
            </a>
          </Text>
        </div>
      </div>
    </div>
  );
}
