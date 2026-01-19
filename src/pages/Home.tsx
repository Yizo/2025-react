import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function Home() {
    return (
        <div className='h-full'>
            <Typography className='h-full flex flex-col items-center justify-center'>
                <Title level={1}>问卷调查 | 在线投票</Title>
                <Paragraph>
                    已累计创建问卷 100 份，发布问卷 98 份，收到问卷 980 份
                </Paragraph>
            </Typography>
        </div>
    )
}