import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import StaticLayout from '@/layouts/StaticLayout';
import { useAppSelector } from '@/store';

export default function AuthRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const token = useAppSelector((state) => state.user.token);

  const whiteList = ['/login', '/register', '/home'];

  useEffect(() => {
    if (whiteList.includes(pathname)) {
      return;
    }
    if (!token) {
      navigate('/login');
    }
  }, [pathname, token]);

  return <StaticLayout />;
}
