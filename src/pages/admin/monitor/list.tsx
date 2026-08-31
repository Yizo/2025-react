import { useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Layout,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { BugOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/date.util';
import { useNavigate } from 'react-router';
import { getMonitorApps } from './api';
import { EditMonitorAppModal } from './edit-system';
import { useMonitorAppManagement } from './use-system-management';
import type { MonitorApp } from './types';

const { Content } = Layout;

interface MonitorSearchValues {
  name?: string;
  code?: string;
  enabled?: boolean;
}

interface MonitorAppQuery extends MonitorSearchValues {
  page: number;
  pageSize: number;
}

export default function MonitorAppList() {
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState<MonitorAppQuery>({ page: 1, pageSize: 20 });
  const [apps, setApps] = useState<MonitorApp[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<MonitorApp>();
  const [searchForm] = Form.useForm<MonitorSearchValues>();
  const { loading: saving, create, update, setEnabled } = useMonitorAppManagement();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMonitorApps(query)
      .then((response) => {
        if (!active) return;
        setApps(response.data.items);
        setTotal(response.data.total);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  function openCreate() {
    setEditingApp(undefined);
    setModalOpen(true);
  }

  function openEdit(app: MonitorApp) {
    setEditingApp(app);
    setModalOpen(true);
  }

  async function handleSave(values: { code: string; name: string; enabled: boolean }) {
    if (editingApp) {
      await update(editingApp, { name: values.name, enabled: values.enabled });
    } else {
      const result = await create({ code: values.code, name: values.name });
      if (result?.ingestKey) {
        modal.info({
          title: '监控应用创建成功',
          content: (
            <div>
              <p>请立即复制并保存 ingestKey，后端不会再次返回明文密钥。</p>
              <Typography.Text code copyable={{ text: result.ingestKey }}>
                {result.ingestKey}
              </Typography.Text>
            </div>
          ),
          okText: '我已保存',
        });
      }
    }
    setModalOpen(false);
    setQuery((current) => ({ ...current, page: 1 }));
  }

  function submitSearch(values: MonitorSearchValues) {
    setQuery({
      page: 1,
      pageSize: query.pageSize,
      ...(values.name?.trim() ? { name: values.name.trim() } : {}),
      ...(values.code?.trim() ? { code: values.code.trim() } : {}),
      ...(values.enabled !== undefined ? { enabled: values.enabled } : {}),
    });
  }

  async function toggleEnabled(app: MonitorApp) {
    await setEnabled(app, !app.enabled);
    setQuery((current) => ({ ...current, page: current.page }));
  }

  return (
    <Content className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Typography.Title level={2} className="!mb-1">
            <BugOutlined className="mr-2" />
            监控应用
          </Typography.Title>
          <Typography.Text type="secondary">保留旧监控服务的应用管理与错误日志入口</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增监控应用
        </Button>
      </div>

      <Card className="!mb-0">
        <Form form={searchForm} layout="inline" onFinish={submitSearch}>
          <Form.Item name="name" label="应用名称">
            <Input allowClear placeholder="模糊搜索" />
          </Form.Item>
          <Form.Item name="code" label="应用编码">
            <Input allowClear placeholder="模糊搜索" />
          </Form.Item>
          <Form.Item name="enabled" label="状态">
            <Select
              allowClear
              options={[
                { label: '启用', value: true },
                { label: '禁用', value: false },
              ]}
              style={{ width: 120 }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button
                onClick={() => {
                  searchForm.resetFields();
                  setQuery({ page: 1, pageSize: query.pageSize });
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="mt-4!">
        <Table<MonitorApp>
          rowKey="id"
          loading={loading}
          dataSource={apps}
          columns={[
            { title: '应用名称', dataIndex: 'name', key: 'name' },
            {
              title: '应用编码',
              dataIndex: 'code',
              key: 'code',
              render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
            },
            {
              title: '状态',
              dataIndex: 'enabled',
              key: 'enabled',
              render: (enabled: boolean) => (
                <Tag color={enabled ? 'success' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>
              ),
            },
            {
              title: '更新时间',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              render: (value: string) => formatDate(value),
            },
            {
              title: '操作',
              key: 'actions',
              width: 230,
              render: (_: unknown, app: MonitorApp) => (
                <Space>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(app)}>
                    编辑
                  </Button>
                  <Button type="link" onClick={() => navigate(`/admin/monitor/${app.id}`)}>
                    查看日志
                  </Button>
                  <Popconfirm
                    title={`确认${app.enabled ? '禁用' : '启用'}此应用？`}
                    onConfirm={() => void toggleEnabled(app)}
                  >
                    <Button type="link" danger={app.enabled}>
                      {app.enabled ? '禁用' : '启用'}
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (page, pageSize) => setQuery((current) => ({ ...current, page, pageSize })),
          }}
        />
      </Card>

      <EditMonitorAppModal
        open={modalOpen}
        record={editingApp}
        loading={saving}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
      />
    </Content>
  );
}
