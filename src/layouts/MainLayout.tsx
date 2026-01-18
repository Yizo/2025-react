import StaticLayout from './StaticLayout'
import { Layout, theme } from 'antd'

const { Header, Content, Footer } = Layout

const ManageLayout = () => {

	const { token } = theme.useToken()

	console.log(token)

	return (
		<Layout className="flex" style={{ height: '100vh' }}>
			<Header className="flex items-center justify-between">
				<div className="text-2xl font-bold" style={{ color: token.colorPrimary }}>
					logo
				</div>
				<div className="text-xl cursor-pointer" style={{ color: token.colorPrimary }}>
					登录
				</div>
			</Header>
			<Content className="mx-6 mt-6 bg-white rounded-lg shadow-md">
				<StaticLayout />
			</Content>
			<Footer className="text-center">
				问卷调查 &copy; {new Date().getFullYear()}
			</Footer>
		</Layout>
	);
};

export default ManageLayout;
