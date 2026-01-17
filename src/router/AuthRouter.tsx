import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import StaticLayout from '@/layouts/StaticLayout'
import { useToken, useUserInfo } from '@/store/user'

export default function AuthRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location
  const token = useToken()
  const userInfo = useUserInfo()


  const whiteList = ['/login', '/register', '/home']

  useEffect(() => {
    console.group('权限验证')
    console.log('pathname', pathname)
    console.log('token', token)
    console.log('userInfo', userInfo)
    console.groupEnd()
    if (whiteList.includes(pathname)) {
      return
    }
    if (!token) {
      // navigate('/home')
    }
  }, [pathname, token])

  return <StaticLayout />
}