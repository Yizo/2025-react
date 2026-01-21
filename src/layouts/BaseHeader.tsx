import { Layout } from 'antd';
import useUserStore from '@/store/user';
import { useNavigate } from 'react-router';

export default function BaseHeader() {
  const textColor = 'white';
  const userInfo = useUserStore((s) => s.userInfo);
  const navigate = useNavigate();
  function handleLogin() {
    if (userInfo) return;
    navigate('/login');
  }

  return (
    <Layout.Header className="flex items-center justify-between">
      <div className="text-2xl font-bold" style={{ color: textColor }}>
        logo
      </div>
      <div className="text-xl cursor-pointer" style={{ color: textColor }} onClick={handleLogin}>
        {userInfo ? userInfo.name : '登录'}
      </div>
    </Layout.Header>
  );
}
