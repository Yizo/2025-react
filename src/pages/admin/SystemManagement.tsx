import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Col, Descriptions, Layout, Row, Space, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import {
  getAppInfo,
  getLiveHealth,
  getReadyHealth,
  initializeSystem,
  type AppInfo,
  type HealthResult,
} from './api';

const { Content } = Layout;

function healthTag(result?: HealthResult, error?: string) {
  if (error) return <Tag color="error">异常</Tag>;
  if (!result) return <Tag>检查中</Tag>;
  return <Tag color="success">正常</Tag>;
}

export default function SystemManagement() {
  const { message } = App.useApp();
  const [appInfo, setAppInfo] = useState<AppInfo>();
  const [live, setLive] = useState<HealthResult>();
  const [ready, setReady] = useState<HealthResult>();
  const [liveError, setLiveError] = useState<string>();
  const [readyError, setReadyError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setLiveError(undefined);
    setReadyError(undefined);
    const [infoResult, liveResult, readyResult] = await Promise.allSettled([
      getAppInfo(),
      getLiveHealth(),
      getReadyHealth(),
    ]);

    if (infoResult.status === 'fulfilled') setAppInfo(infoResult.value.data);
    if (liveResult.status === 'fulfilled') setLive(liveResult.value.data);
    else setLiveError(liveResult.reason instanceof Error ? liveResult.reason.message : '检查失败');
    if (readyResult.status === 'fulfilled') setReady(readyResult.value.data);
    else
      setReadyError(readyResult.reason instanceof Error ? readyResult.reason.message : '检查失败');
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  async function handleInitialize() {
    setInitializing(true);
    try {
      await initializeSystem();
      message.success('系统初始化完成');
    } finally {
      setInitializing(false);
    }
  }

  return (
    <Content className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Typography.Title level={2} className="!mb-1">
            <SettingOutlined className="mr-2" />
            管理首页
          </Typography.Title>
          <Typography.Text type="secondary">
            查看 admin-api 运行状态并执行系统初始化
          </Typography.Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void loadHealth()}>
            刷新状态
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={initializing}
            onClick={() => void handleInitialize()}
          >
            执行系统初始化
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="应用信息">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="名称">{appInfo?.name ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="版本">{appInfo?.version ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="环境">{appInfo?.environment ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="服务消息">{appInfo?.message ?? '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="健康检查">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="进程存活">
                {healthTag(live, liveError)}{' '}
                {liveError && <Typography.Text type="danger">{liveError}</Typography.Text>}
              </Descriptions.Item>
              <Descriptions.Item label="服务就绪">
                {healthTag(ready, readyError)}{' '}
                {readyError && <Typography.Text type="danger">{readyError}</Typography.Text>}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Content>
  );
}
