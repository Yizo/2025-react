import dayjs from 'dayjs';
import { Descriptions, Drawer } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router';
import { getBusinessSystem, getMonitorLogList } from './api';
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  type BusinessSystem,
  type ClientErrorRecord,
  type MonitorEventType,
} from './types';
import type { ColumnsType } from 'antd/es/table';

function formatTimestamp(value?: string | number) {
  if (value == null || value === '') return '-';
  const n = typeof value === 'string' ? Number(value) : value;
  const d = Number.isFinite(n) && n > 1e11 ? dayjs(n) : dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : String(value);
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

  const items = [
    {
      label: '类型',
      children: <Tag color={EVENT_TYPE_COLORS[record.type]}>{EVENT_TYPE_LABELS[record.type]}</Tag>,
    },
    { label: '消息', children: record.message, span: 2 },
    { label: '上报时间', children: formatTimestamp(record.timestamp) },
    { label: '入库时间', children: formatDate(record.createdAt) },
    { label: 'App ID', children: record.appId },
    { label: 'Release', children: record.release || '-' },
    { label: 'URL', children: record.url || '-', span: 2 },
    { label: '文件名', children: record.filename || '-' },
    {
      label: '位置',
      children:
        record.lineno != null
          ? `${record.lineno}${record.colno != null ? `:${record.colno}` : ''}`
          : '-',
    },
    { label: 'IP', children: record.ip || '-' },
    { label: 'User Agent', children: record.userAgent || '-', span: 2 },
    {
      label: 'Tags',
      children: record.tags ? (
        <pre className="m-0 text-xs whitespace-pre-wrap">
          {JSON.stringify(record.tags, null, 2)}
        </pre>
      ) : (
        '-'
      ),
      span: 2,
    },
    {
      label: 'Context',
      children: record.context ? (
        <pre className="m-0 text-xs whitespace-pre-wrap">
          {JSON.stringify(record.context, null, 2)}
        </pre>
      ) : (
        '-'
      ),
      span: 2,
    },
    {
      label: 'Extra',
      children: record.extra ? (
        <pre className="m-0 text-xs whitespace-pre-wrap">
          {JSON.stringify(record.extra, null, 2)}
        </pre>
      ) : (
        '-'
      ),
      span: 2,
    },
    {
      label: 'Stack',
      children: record.stack ? (
        <pre className="m-0 text-xs whitespace-pre-wrap max-h-60 overflow-auto">{record.stack}</pre>
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

function useLogSearch(systemId: number) {
  const { tableProps, search } = useAntdTable(getTableData, {
    defaultParams: [{ current: 1, pageSize: 10, total: 0 }],
    refreshDeps: [systemId],
  });

  Object.assign(tableProps, {
    pagination: {
      ...tableProps.pagination,
      ...tableConfig.pagination,
    },
  });

  function getTableData(...args: Record<string, unknown>[]) {
    const [pagination] = args;
    const { current, pageSize } = pagination as { current: number; pageSize: number };
    return getMonitorLogList({ systemId, page: current, pageSize }).then((res) => ({
      list: res.data,
      total: res.total,
    }));
  }

  return { tableProps, search };
}

export default function MonitorLogList() {
  const { systemId: systemIdParam = '' } = useParams<{ systemId: string }>();
  const systemId = Number(systemIdParam);
  const location = useLocation();
  const navigate = useNavigate();
  const [system, setSystem] = useState<BusinessSystem | undefined>(
    (location.state as { system?: BusinessSystem } | null)?.system
  );
  const [record, setRecord] = useState<ClientErrorRecord>();

  const { tableProps } = useLogSearch(systemId);

  useEffect(() => {
    if (!system && Number.isFinite(systemId)) {
      getBusinessSystem(systemId).then((res) => setSystem(res.data));
    }
  }, [system, systemId]);

  const columns: ColumnsType<ClientErrorRecord> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: MonitorEventType) => (
        <Tag color={EVENT_TYPE_COLORS[type]}>{EVENT_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '上报时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (ts?: string) => formatTimestamp(ts),
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
      render: (ip?: string) => ip || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, row) => (
        <Button type="link" onClick={() => setRecord(row)}>
          详情
        </Button>
      ),
    },
  ];

  const systemName = system?.name ?? (Number.isFinite(systemId) ? `系统 #${systemId}` : '');

  return (
    <Layout>
      <Layout.Content className="p-6">
        <div className="mb-6">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <HomeOutlined /> },
              { title: <a onClick={() => navigate('/admin/monitor')}>业务系统</a> },
              { title: systemName },
            ]}
          />
          <h1 className="text-2xl font-bold flex items-center">
            <BugOutlined className="mr-2" />
            {systemName}
          </h1>
          {system && (
            <p className="mt-2">
              App ID:{' '}
              <Typography.Text copyable={{ text: system.appId }}>{system.appId}</Typography.Text>
              {' · '}
              <Tag color={system.enabled ? 'green' : 'default'}>
                {system.enabled ? '启用' : '禁用'}
              </Tag>
            </p>
          )}
        </div>

        <Card className="shadow-sm">
          <Table
            columns={columns}
            rowKey="id"
            tableLayout="fixed"
            {...tableProps}
            onRow={(row) => ({
              onClick: () => setRecord(row),
              style: { cursor: 'pointer' },
            })}
          />
        </Card>

        <LogDetailDrawer open={!!record} record={record} onClose={() => setRecord(undefined)} />
      </Layout.Content>
    </Layout>
  );
}
