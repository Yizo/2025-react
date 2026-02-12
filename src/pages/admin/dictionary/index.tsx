import useUrlState from '@ahooksjs/use-url-state';
import TypeList from './type-list';
import DataList from './data-list';
import type { ChildRef } from './types';

const { Content } = Layout;

export default function DictionaryManagement() {
  const [state, setState] = useUrlState({ activeKey: undefined, typeId: undefined });
  const activeKey = useMemo(() => state.activeKey, [state]);
  const typeListRef = useRef<ChildRef>(null);
  const dataListRef = useRef<ChildRef>(null);

  function onAdd() {
    if (activeKey) {
      dataListRef.current?.onAdd();
    } else {
      typeListRef.current?.onAdd();
    }
  }

  function toggle(typeId?: string) {
    setState({
      typeId,
      activeKey: activeKey === 'data' ? 'type' : 'data',
    });
  }

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
            {activeKey ? '新增字典数据' : '新增字典类型'}
          </Button>
        </div>
        {activeKey === 'data' ? (
          <DataList ref={dataListRef} toggle={toggle} />
        ) : (
          <TypeList ref={typeListRef} toggle={toggle} />
        )}
      </Content>
    </Layout>
  );
}
