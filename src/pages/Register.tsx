import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import { Link } from 'react-router';
import { useRequest } from 'ahooks';
import { request } from '@/services';
import { LOGIN_PATH } from '@/router/constant';

const { Title, Text } = Typography;
const { Item, useForm } = Form;

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址' },
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '请输入有效的邮箱地址',
    },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码长度至少6个字符' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    ({ getFieldValue }: any) => ({
      validator(_: any, value: string) {
        if (!value || getFieldValue('password') === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('两次输入的密码不一致'));
      },
    }),
  ],
};

function useRegister() {
  const { runAsync, loading } = useRequest(
    async (values: any) => {
      const result = await request.post('/api/auth/register', values);
      return result;
    },
    {
      manual: true,
    }
  );
  return { runAsync, loading };
}

export default function Register() {
  const [form] = useForm();
  const themeColor = import.meta.env.VITE_THEME;
  const { runAsync, loading } = useRegister();
  const navigate = useNavigate();

  async function onFinish(values: any) {
    try {
      console.log('注册信息:', values);
      if (loading) return;
      await runAsync(values);
      message.success('注册成功');
      navigate(LOGIN_PATH);
    } catch (err) {
      console.log('注册失败:', err);
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
            创建账户
          </Title>
          <Text className="text-gray-600">加入我们，开始您的旅程</Text>
        </div>

        {/* 注册表单卡片 */}
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
            <Item name="username" rules={rules.username}>
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="请输入用户名"
                className="rounded-lg"
              />
            </Item>

            {/* 邮箱 */}
            <Item name="email" rules={rules.email}>
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="请输入邮箱地址"
                className="rounded-lg"
              />
            </Item>

            {/* 密码 */}
            <Item name="password" rules={rules.password}>
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                className="rounded-lg"
              />
            </Item>

            {/* 确认密码 */}
            <Item name="confirmPassword" rules={rules.confirmPassword}>
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请再次输入密码"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                className="rounded-lg"
              />
            </Item>

            {/* 按钮区域 */}
            <Item className="mb-0">
              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
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
                  创建账户
                </Button>
                <Button
                  block
                  size="large"
                  onClick={onReset}
                  disabled={loading}
                  className="rounded-lg font-medium border-gray-300 hover:border-gray-400"
                >
                  重置表单
                </Button>
              </Space>
            </Item>
          </Form>

          {/* 分割线 */}
          <Divider className="!my-6">
            <Text className="text-gray-500">已有账户？</Text>
          </Divider>

          {/* 登录链接 */}
          <div className="text-center">
            <Link to="/login" className="font-medium transition-colors duration-200">
              返回登录
            </Link>
          </div>
        </Card>

        {/* 底部提示 */}
        <div className="text-center mt-6">
          <Text className="text-gray-500 text-sm">
            注册即表示您同意我们的
            <a href="#" className="">
              服务条款
            </a>
            和
            <a href="#" className="">
              隐私政策
            </a>
          </Text>
        </div>
      </div>
    </div>
  );
}
