import useUrlState from '@ahooksjs/use-url-state';
import TypeList from './type-list';
import DataList from './data-list';
import type { ChildRef } from './types';

const { Content } = Layout;
const defaultKey = 'type';
const keys = ['type', 'data'] as const;

type ActiveKey = (typeof keys)[number];

export default function DictionaryManagement() {
  const [state, setState] = useUrlState({
    activeKey: defaultKey,
    typeId: undefined,
    typeName: undefined,
  });
  const activeKey = useMemo(() => state.activeKey as ActiveKey, [state]);

  const componentsMap = {
    type: {
      component: TypeList,
      ref: useRef<ChildRef>(null),
    },
    data: {
      component: DataList,
      ref: useRef<ChildRef>(null),
    },
  } as const;
  const ListComponent = componentsMap[activeKey]?.component;
  const currentRef = componentsMap[activeKey]?.ref;

  function onAdd() {
    currentRef?.current?.onAdd();
  }

  function toggle(typeId?: string, typeName?: string) {
    setState({
      typeId,
      typeName,
      activeKey: activeKey === 'data' ? 'type' : 'data',
    });
  }

  return (
    <Layout>
      <Content className="p-6">
        <div className="mb-6 flex items-center justify-between">
          {activeKey === 'type' ? (
            <div>
              <h1 className="text-2xl font-bold  flex items-center">
                <BookOutlined className="mr-2" />
                字典管理
              </h1>
              <p className="mt-2">管理系统字典类型和键值对数据</p>
            </div>
          ) : (
            <Breadcrumb
              items={[
                { title: <HomeOutlined /> },
                { title: <a>字典类型</a>, onClick: () => toggle() },

                state.typeName && { title: state.typeName },
              ]}
            />
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {activeKey === 'type' ? '新增字典类型' : '新增字典数据'}
          </Button>
        </div>
        <ListComponent toggle={toggle} ref={currentRef} />
      </Content>
    </Layout>
  );
}
