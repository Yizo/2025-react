import { Divider } from 'antd';

const { Content } = Layout;

export default function Menu2() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [menuList, setMenuList] = useState([]);
  const [treeMenuList, setTreeMenuList] = useState([]);
  const menuHandleOk = ({ key }: { key: string }) => {
    setSelectedKeys([key]);
  };
  return (
    <Layout className="h-full">
      <Content className="flex h-full m-6 ui-bg-200 border ui-border rounded-lg">
        <div className="w-1/4 p-4">
          <Button type="primary" icon={<PlusOutlined />}>
            新增菜单
          </Button>
          <Menu selectedKeys={selectedKeys} onClick={menuHandleOk} className="mt-4!" />
        </div>
        <Divider orientation="vertical" className="block! h-full!" />
        <div className="w-3/4 p-4">

        </div>
      </Content>
    </Layout>
  );
}
