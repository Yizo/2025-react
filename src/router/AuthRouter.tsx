import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import StaticLayout from '@/layouts/StaticLayout';
import { useAppSelector } from '@/store';

export default function AuthRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const token = useAppSelector((state) => state.user.token);
  const userInfo = useAppSelector((state) => state.user.userInfo);

  const whiteList = ['/login', '/register', '/home'];

  useEffect(() => {
    console.group('权限验证');
    console.log('pathname', pathname);
    console.log('token', token);
    console.log('userInfo', userInfo);
    console.groupEnd();
    if (whiteList.includes(pathname)) {
      return;
    }
    if (!token) {
      navigate('/login');
    }
  }, [pathname, token]);

  return <StaticLayout />;
}
