import { Tabs } from 'antd';
import { useSearchParams } from 'react-router';
import TypeList from './type-list';
import DataList from './data-list';

const { Content } = Layout;

const defaultActiveKey = 'types';

export default function DictionaryManagement() {
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [searchParams, setSearchParams] = useSearchParams();
  const typeListRef = useRef<{ onAdd: () => void }>(null);
  const dataListRef = useRef<{ onAdd: () => void }>(null);
  const children = [
    {
      key: 'types',
      label: '字典类型',
      children: <TypeList ref={typeListRef} />,
    },
    {
      key: 'data',
      label: '字典数据',
      children: <DataList ref={dataListRef} />,
    },
  ];

  function onChangeActiveKey(key: string) {
    setActiveKey(key);
    setSearchParams({ active: key });
  }

  function onAdd() {
    if (activeKey === 'types') {
      typeListRef.current?.onAdd();
    } else {
      dataListRef.current?.onAdd();
    }
  }

  useEffect(() => {
    const active = searchParams.get('active');
    if (active) {
      setActiveKey(active);
    }
  }, []);

  return (
    <Layout>
      <Content className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold  flex items-center">
              <BookOutlined className="mr-2" />
              字典管理
            </h1>
            <p className="mt-2">管理系统字典类型和键值对数据</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {activeKey === 'types' ? '新增字典类型' : '新增字典数据'}
          </Button>
        </div>
        <Tabs
          activeKey={activeKey}
          defaultActiveKey={defaultActiveKey}
          type="card"
          onChange={onChangeActiveKey}
          items={children}
        />
      </Content>
    </Layout>
  );
}
