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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: 'var(--color-base-100)',
      }}
    >
      <div className="w-full max-w-md">
        {/* 头部区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
            <UserOutlined className="text-2xl " />
          </div>
          <Title level={2} className=" !mb-2 !font-bold">
            欢迎回来
          </Title>
          <Text>请登录您的账户</Text>
        </div>

        {/* 登录表单卡片 */}
        <Card
          className="shadow-xl border-0"
          style={{
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
                prefix={<UserOutlined className="" />}
                placeholder="请输入用户名"
                className="rounded-lg"
              />
            </Item>

            {/* 密码 */}
            <Item name="password" initialValue={'123456'} rules={rules.password}>
              <Input.Password
                prefix={<LockOutlined className="" />}
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
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
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
                  className="rounded-lg font-medium "
                >
                  重置
                </Button>
              </Space>
            </Item>
          </Form>

          {/* 分割线 */}
          <Divider className="!my-6">
            <Text className="">还没有账户？</Text>
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
          <Text className="text-sm">
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
