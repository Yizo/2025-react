import { Form, Input, Button, App } from 'antd';
import { useLogin } from '@/store/user';
import { useNavigate } from 'react-router';
import { MANAGE_PATH } from '@/router/constant';

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
      if(_loading) return;
      await onLogin(values);
      message.success('登录成功');
      setTimeout(() => {
        navigate(MANAGE_PATH);
      }, 1000);
    } catch (err) {
      console.log('登录失败:', err);
    }
  }

  function onReset() {
    form.resetFields();
  }

  return (
    <div className="flex justify-center" style={{ height: '100vh' }}>
      <Form form={form} onFinish={onFinish} style={{ paddingTop: '20vh', width: '300px' }}>
        <Item name="username" label="Username" initialValue={'admin'} rules={rules.username}>
          <Input />
        </Item>
        <Item name="password" label="Password" initialValue={'123456'} rules={rules.password}>
          <Input.Password />
        </Item>
        <Item wrapperCol={{ offset: 6, span: 18 }} rootClassName="pt-4">
          <Button loading={_loading} type="primary" block htmlType="submit">
            登录
          </Button>
          <Button loading={_loading} block onClick={onReset} className="mt-2">
            重置
          </Button>
        </Item>
      </Form>
    </div>
  );
}
