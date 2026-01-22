import { Layout } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/user';
import { useNavigate } from 'react-router';
import { LOGIN_PATH } from '@/router/constant';

const items = [
  {
    label: '退出登录',
    key: 'logout',
  },
];

export default function BaseHeader() {
  const textColor = 'white';
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  function handleLogin() {
    if (userInfo) return;
    navigate(LOGIN_PATH);
  }

  const onClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      dispatch(logout());
      navigate(LOGIN_PATH);
    }
  };

  return (
    <Layout.Header className="flex items-center justify-between">
      <div className="text-2xl font-bold" style={{ color: textColor }}>
        logo
      </div>
      <div className="text-xl cursor-pointer" style={{ color: textColor }}>
        {userInfo ? (
          <Dropdown menu={{ items, onClick }}>
            <Space>
              {userInfo.name}
              <DownOutlined />
            </Space>
          </Dropdown>
        ) : (
          <span className="text-white" onClick={handleLogin}>
            登录
          </span>
        )}
      </div>
    </Layout.Header>
  );
}
