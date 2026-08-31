import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, Card, Descriptions, Drawer, Layout, Table, Tag, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router';
import { formatDate } from '@/utils/date.util';
import { getClientErrors } from './api';
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  type ClientErrorRecord,
  type MonitorApp,
  type MonitorEventType,
} from './types';
import type { ColumnsType } from 'antd/es/table';

type MonitorErrorContext = Record<string, unknown> & {
  eventType?: string;
  url?: string | null;
  release?: string | null;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

function formatTimestamp(value?: string | number) {
  if (value == null || value === '') return '-';
  const numberValue = typeof value === 'string' ? Number(value) : value;
  const date =
    Number.isFinite(numberValue) && numberValue > 1e11 ? dayjs(numberValue) : dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : String(value);
}

function getContext(record: ClientErrorRecord) {
  return (record.context ?? {}) as MonitorErrorContext;
}

function getEventType(record: ClientErrorRecord): MonitorEventType {
  const eventType = getContext(record).eventType;
  return eventType && eventType in EVENT_TYPE_LABELS
    ? (eventType as MonitorEventType)
    : 'caught-error';
}

function stringify(value: unknown) {
  return value == null ? '-' : JSON.stringify(value, null, 2);
}

function LogDetailDrawer({
  open,
  record,
  onClose,
}: {
  open: boolean;
  record?: ClientErrorRecord;
  onClose: () => void;
}) {
  if (!record) return null;
  const context = getContext(record);
  const type = getEventType(record);

  const items = [
    {
      label: '类型',
      children: <Tag color={EVENT_TYPE_COLORS[type]}>{EVENT_TYPE_LABELS[type]}</Tag>,
    },
    { label: '消息', children: record.message, span: 2 },
    { label: '发生时间', children: formatTimestamp(record.occurredAt) },
    { label: '入库时间', children: formatDate(record.createdAt) },
    { label: '应用编码', children: record.appId },
    { label: 'Event ID', children: record.eventId },
    { label: 'Fingerprint', children: record.fingerprint, span: 2 },
    { label: 'Release', children: context.release || '-' },
    { label: 'URL', children: context.url || '-', span: 2 },
    {
      label: 'Tags',
      children: <pre className="m-0 text-xs whitespace-pre-wrap">{stringify(context.tags)}</pre>,
      span: 2,
    },
    {
      label: 'Extra',
      children: <pre className="m-0 text-xs whitespace-pre-wrap">{stringify(context.extra)}</pre>,
      span: 2,
    },
    {
      label: 'Context',
      children: (
        <pre className="m-0 max-h-60 overflow-auto text-xs whitespace-pre-wrap">
          {stringify(context)}
        </pre>
      ),
      span: 2,
    },
    {
      label: 'Stack',
      children: record.stack ? (
        <pre className="m-0 max-h-60 overflow-auto text-xs whitespace-pre-wrap">{record.stack}</pre>
      ) : (
        '-'
      ),
      span: 2,
    },
  ];

  return (
    <Drawer title="日志详情" width={720} open={open} onClose={onClose}>
      <Descriptions column={2} bordered size="small" items={items} />
    </Drawer>
  );
}

function useLogSearch(appId: string) {
  const [items, setItems] = useState<ClientErrorRecord[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    let active = true;
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
    setError(undefined);
    if (!appId) return;

    setLoading(true);
    getClientErrors({ appId, pageSize: 20 })
      .then((response) => {
        if (!active || currentRequest !== requestId.current) return;
        setItems(response.data.items);
        setNextCursor(response.data.nextCursor);
        setHasMore(response.data.hasMore);
      })
      .catch((reason: unknown) => {
        if (!active || currentRequest !== requestId.current) return;
        setError(reason instanceof Error ? reason.message : '日志加载失败');
      })
      .finally(() => {
        if (active && currentRequest === requestId.current) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appId]);

  async function loadMore() {
    if (!appId || loading || !hasMore || !nextCursor) return;
    const currentRequest = requestId.current;
    setLoading(true);
    setError(undefined);
    try {
      const response = await getClientErrors({ appId, pageSize: 20, cursor: nextCursor });
      if (currentRequest !== requestId.current) return;
      setItems((current) => [...current, ...response.data.items]);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);
    } catch (reason: unknown) {
      if (currentRequest === requestId.current) {
        setError(reason instanceof Error ? reason.message : '日志加载失败');
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  return { items, loading, error, hasMore, loadMore };
}

export default function MonitorLogList() {
  const { systemId: appId = '' } = useParams<{ systemId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [app] = useState<MonitorApp | undefined>(
    (location.state as { app?: MonitorApp } | null)?.app
  );
  const [record, setRecord] = useState<ClientErrorRecord>();
  const { items, loading, error, hasMore, loadMore } = useLogSearch(appId);

  const columns: ColumnsType<ClientErrorRecord> = [
    {
      title: '类型',
      key: 'type',
      width: 140,
      render: (_: unknown, row) => {
        const type = getEventType(row);
        return <Tag color={EVENT_TYPE_COLORS[type]}>{EVENT_TYPE_LABELS[type]}</Tag>;
      },
    },
    { title: '消息', dataIndex: 'message', key: 'message', ellipsis: true },
    {
      title: '发生时间',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      width: 180,
      render: (value: string) => formatTimestamp(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: unknown, row) => (
        <Button type="link" onClick={() => setRecord(row)}>
          详情
        </Button>
      ),
    },
  ];

  const appName = app?.name ?? (appId ? `应用 ${appId}` : '监控应用');

  return (
    <Layout.Content className="p-6">
      <div className="mb-6">
        <Breadcrumb
          className="mb-4"
          items={[
            { title: <HomeOutlined /> },
            { title: <a onClick={() => navigate('/admin/monitor')}>监控应用</a> },
            { title: appName },
          ]}
        />
        <Typography.Title level={2} className="!mb-1">
          {appName}
        </Typography.Title>
        {app && (
          <Typography.Text type="secondary">
            应用编码：<Typography.Text code>{app.code}</Typography.Text>
            {' · '}
            {app.enabled ? '启用' : '禁用'}
          </Typography.Text>
        )}
      </div>

      {error && <Alert className="mb-4" type="error" message={error} showIcon />}
      <Card>
        <Table<ClientErrorRecord>
          columns={columns}
          rowKey="id"
          dataSource={items}
          loading={loading && items.length === 0}
          pagination={false}
          onRow={(row) => ({ onClick: () => setRecord(row), style: { cursor: 'pointer' } })}
        />
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => void loadMore()}
            loading={loading && items.length > 0}
            disabled={!hasMore}
          >
            {hasMore ? '加载更多' : items.length ? '没有更多日志' : '暂无日志'}
          </Button>
        </div>
      </Card>
      <LogDetailDrawer open={!!record} record={record} onClose={() => setRecord(undefined)} />
    </Layout.Content>
  );
}
