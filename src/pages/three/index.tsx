import { Card, Layout, Menu, Space, Switch, Typography } from 'antd';
import BasicScene from './BasicScene';

export default function TreePage() {
  const examples = useMemo(
    () => [
      {
        key: 'basic',
        title: '基础场景（旋转方块）',
        element: <BasicScene />,
      },
    ],
    []
  );

  const [activeKey, setActiveKey] = useState(examples[0]?.key ?? '');
  const [visible, setVisible] = useState(true);

  const active = examples.find((x) => x.key === activeKey) ?? examples[0];

  return (
    <Layout className="w-full h-screen">
      <Layout.Sider width={260} theme="light">
        <div className="px-4 py-3">
          <Typography.Title level={5} style={{ margin: 0 }}>
            Three 示例目录
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
        >
          {visible ? active?.element : null}
        </Card>
      </Layout.Content>
    </Layout>
  );
}
