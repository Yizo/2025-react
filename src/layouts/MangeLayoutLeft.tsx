import { Button } from 'antd'
import { PlusOutlined, FileOutlined, StarOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router'

interface MenuItem {
    key: string
    label: string
    icon: React.ReactNode
}

const menus = [
    {
        key: '/manage',
        label: '我的问卷',
        icon: <FileOutlined />,
    },
    {
        key: '/manage/star',
        label: '星标问卷',
        icon: <StarOutlined />,
    },
    {
        key: '/manage/trash',
        label: '回收站',
        icon: <DeleteOutlined />,
    },
]


function MangeLayoutLeft() {

    const navigate = useNavigate()
    const location = useLocation()
    const { pathname } = location

    console.log('pathname', pathname)

    const handleClick = (menu: MenuItem) => {
        navigate(menu.key)
    }

    return (
        <div>
            <Button type='primary' icon={<PlusOutlined />}>新增问卷</Button>
            <div className='flex flex-col gap-2 pt-10'>
                {
                    menus.map((menu) => (
                        <Button type={pathname === menu.key ? 'primary' : 'text'} key={menu.key} icon={menu.icon} onClick={() => handleClick(menu)}>
                            {menu.label}
                        </Button>
                    ))
                }
            </div>
        </div>
    )
}

export default MangeLayoutLeft