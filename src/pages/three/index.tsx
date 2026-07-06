import { Card, Layout, Menu, Space, Switch, Typography } from 'antd';
import { threeNavigationGroups } from './navigation';

// 从 hash 里恢复当前一级/二级导航，保证刷新后还能停留在当前示例。
function readHashSelection() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  return {
    groupKey: params.get('group') ?? '',
    itemKey: params.get('item') ?? '',
  };
}

// 当 hash 中的导航 key 无效时，统一回退到第一个一级导航和它的第一个二级项。
function resolveSelection(groupKey: string, itemKey: string) {
  const fallbackGroup = threeNavigationGroups[0];
  const activeGroup =
    threeNavigationGroups.find((group) => group.key === groupKey) ?? fallbackGroup;
  const activeItem =
    activeGroup?.items.find((item) => item.key === itemKey) ?? activeGroup?.items[0];

  return {
    groupKey: activeGroup?.key ?? '',
    itemKey: activeItem?.key ?? '',
  };
}

export default function TreePage() {
  // 父组件只负责导航状态和当前内容切换，具体导航数据都来自配置目录。
  const groups = threeNavigationGroups;
  const { groupKey: initialGroupKey, itemKey: initialItemKey } = readHashSelection();
  const initialSelection = resolveSelection(initialGroupKey, initialItemKey);
  const [activeGroupKey, setActiveGroupKey] = useState(initialSelection.groupKey);
  const [activeKey, setActiveKey] = useState(initialSelection.itemKey);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 一级导航切换后，若当前二级项不属于新分组，则自动回退到该分组的默认项。
    const nextSelection = resolveSelection(activeGroupKey, activeKey);

    if (nextSelection.groupKey !== activeGroupKey) {
      setActiveGroupKey(nextSelection.groupKey);
    }

    if (nextSelection.itemKey !== activeKey) {
      setActiveKey(nextSelection.itemKey);
    }
  }, [activeGroupKey, activeKey]);

  useEffect(() => {
    // 监听浏览器前进/后退带来的 hash 变化，让页面状态和 URL 保持双向同步。
    const handleHashChange = () => {
      const { groupKey, itemKey } = readHashSelection();
      const nextSelection = resolveSelection(groupKey, itemKey);

      setActiveGroupKey(nextSelection.groupKey);
      setActiveKey(nextSelection.itemKey);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    // 当前选中的一级/二级导航写回 hash，不新增路由，只保留页面内定位状态。
    const params = new URLSearchParams();

    if (activeGroupKey) {
      params.set('group', activeGroupKey);
    }

    if (activeKey) {
      params.set('item', activeKey);
    }

    const nextHash = params.toString();

    if (window.location.hash.replace(/^#/, '') !== nextHash) {
      const nextUrl = nextHash
        ? `${window.location.pathname}${window.location.search}#${nextHash}`
        : `${window.location.pathname}${window.location.search}`;

      window.history.replaceState(null, '', nextUrl);
    }
  }, [activeGroupKey, activeKey]);

  const activeGroup = groups.find((group) => group.key === activeGroupKey) ?? groups[0];
  const examples = activeGroup?.items ?? [];
  const active = examples.find((x) => x.key === activeKey) ?? examples[0];

  return (
    <Layout className="h-screen w-full">
      <Layout className="h-full">
        <Layout.Header className="bg-white px-4!">
          <Menu
            mode="horizontal"
            selectedKeys={activeGroup ? [activeGroup.key] : []}
            items={groups.map((group) => ({
              key: group.key,
              label: group.title,
            }))}
            onClick={(e) => setActiveGroupKey(e.key)}
            className="flex justify-end"
          />
        </Layout.Header>

        <Layout className="min-h-0">
          <Layout.Sider width={260} theme="light">
            <div className="px-4 py-3">
              <Typography.Title level={5} style={{ margin: 0 }}>
                {activeGroup?.title ?? '示例目录'}
              </Typography.Title>
            </div>
            <Menu
              selectedKeys={[activeKey]}
              items={examples.map((x) => ({ key: x.key, label: x.title }))}
              onClick={(e) => setActiveKey(e.key)}
            />
          </Layout.Sider>

          <Layout.Content className="p-4">
            <Card
              title={
                <Space size={12}>
                  <Typography.Text strong>{active?.title ?? '未选择示例'}</Typography.Text>
                  <Switch
                    checked={visible}
                    onChange={setVisible}
                    checkedChildren="显示"
                    unCheckedChildren="隐藏"
                  />
                </Space>
              }
              classNames={{
                root: 'h-full flex flex-col',
                body: 'flex-auto',
              }}
            >
              {visible ? active?.element : null}
            </Card>
          </Layout.Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
