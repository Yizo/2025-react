import { LogoutOutlined, SettingOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAppSelector } from '@/store';
import { useLogout } from '@/store/user';
import { useNavigate } from 'react-router';
import { LOGIN_PATH } from '@/router/constant';
import { useAppDispatch } from '@/store';
import { setTheme } from '@/store/system';

const settingItems: MenuProps['items'] = [
  {
    label: '亮色模式',
    key: 'light',
    icon: <SunOutlined />,
  },
  {
    label: '暗色模式',
    key: 'dark',
    icon: <MoonOutlined />,
  },
  {
    type: 'divider',
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: <LogoutOutlined />,
  },
];

export default function UserProfileDropdown() {
  const textColor = 'white';
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { onLogout, loading: _loading } = useLogout();

  function handleLogin() {
    if (userInfo) return;
    navigate(LOGIN_PATH);
  }

  async function onSettingClick({ key }: { key: string }) {
    if (_loading) return;
    if (key === 'light') {
      dispatch(setTheme('light'));
    }
    if (key === 'dark') {
      dispatch(setTheme('dark'));
    }
    if (key === 'logout') {
      await onLogout();
      navigate(LOGIN_PATH);
    }
  }

  return (
    <Popover
      className="border-0"
      content={<Menu className="border-0" items={settingItems} onClick={onSettingClick} />}
    >
      <div className="flex items-center gap-2">
        <div className="cursor-pointer">
          {userInfo ? userInfo.name : <span onClick={handleLogin}>登录</span>}
        </div>
        <div className="cursor-pointer">
          <SettingOutlined />
        </div>
      </div>
    </Popover>
  );
}
