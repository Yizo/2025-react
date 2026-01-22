import { Form, Input, Button } from 'antd';
import { request } from '@/services';
import { useRequest } from 'ahooks';
import useUserStore from '@/store/user';
import { useNavigate } from 'react-router';
import { HOME_PATH } from '@/router/constant';

const { Item, useForm } = Form;

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
};

function useLogin() {
  const setUserInfo = useUserStore((s) => s.set);
  const { runAsync, loading } = useRequest(
    async (values: any) => {
      const result = await request.post('/v1/auth/login', values);
      return result;
    },
    {
      manual: true,
    }
  );

  async function onLogin(values: any) {
    const result = await runAsync(values);
    console.log('result', result);
    const { data, message } = result;
    console.log('登录成功:', data, message);
    setUserInfo({
      token: data.token,
      userInfo: {
        name: data.username,
      },
    });
  }

  return { onLogin, loading };
}

export default function Login() {
  const [form] = useForm();
  const navigate = useNavigate();
  const { onLogin, loading: _loading } = useLogin();

  async function onFinish(values: any) {
    try {
      await onLogin(values);
      message.success('登录成功');
      setTimeout(() => {
        navigate(HOME_PATH);
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
        <Item name="username" label="Username" initialValue={'张三'} rules={rules.username}>
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
