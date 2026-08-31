import { useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';
import { formatDate } from '@/utils/date.util';
import {
  createDictData,
  getDictType,
  getDictData,
  removeDictData,
  updateDictData,
  type DictData,
  type DictDataQuery,
  type DictType,
  type Status,
} from './api';

const { Content } = Layout;

const statusOptions: { label: string; value: Status }[] = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

interface DictDataFormValues {
  label: string;
  value: string;
  sort: number;
  status: Status;
  remark?: string;
}

export default function DictionaryDataManagement() {
  const { message } = App.useApp();
  const { dictTypeId = '', dictType = '' } = useParams<{
    dictTypeId: string;
    dictType: string;
  }>();
  const numericTypeId = Number(dictTypeId);
  const [type, setType] = useState<DictType>();
  const [query, setQuery] = useState<DictDataQuery>({ page: 1, pageSize: 20, dictType });
  const [data, setData] = useState<DictData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<DictData>();
  const [searchForm] = Form.useForm<Pick<DictDataQuery, 'label' | 'value' | 'status'>>();
  const [form] = Form.useForm<DictDataFormValues>();

  useEffect(() => {
    if (!Number.isInteger(numericTypeId) || !dictType) return;
    getDictType(numericTypeId).then((response) => setType(response.data));
  }, [dictType, numericTypeId]);

  useEffect(() => {
    if (!dictType) return;
    let active = true;
    setLoading(true);
    getDictData(query)
      .then((response) => {
        if (!active) return;
        setData(response.data.items);
        setTotal(response.data.total);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dictType, query]);

  function openCreate() {
    setEditingData(undefined);
    form.resetFields();
    form.setFieldsValue({ sort: 0, status: 1 });
    setModalOpen(true);
  }

  function openEdit(item: DictData) {
    setEditingData(item);
    form.setFieldsValue({
      label: item.label,
      value: item.value,
      sort: item.sort,
      status: item.status,
      remark: item.remark ?? undefined,
    });
    setModalOpen(true);
  }

  async function saveData(values: DictDataFormValues) {
    const payload = {
      label: values.label,
      value: values.value,
      sort: values.sort ?? 0,
      status: values.status,
      remark: values.remark?.trim() || null,
    };
    if (editingData) {
      await updateDictData(editingData.id, payload);
      message.success('字典数据更新成功');
    } else {
      await createDictData({ ...payload, dictType });
      message.success('字典数据创建成功');
    }
    setModalOpen(false);
    setQuery((current) => ({ ...current, page: 1 }));
  }

  async function handleRemove(item: DictData) {
    await removeDictData(item.id);
    message.success('字典数据已删除');
    setQuery((current) => ({ ...current, page: 1 }));
  }

  function submitSearch(values: Partial<DictDataQuery>) {
    setQuery({
      page: 1,
      pageSize: query.pageSize,
      dictType,
      ...(values.label?.trim() ? { label: values.label.trim() } : {}),
      ...(values.value?.trim() ? { value: values.value.trim() } : {}),
      ...(values.status !== undefined ? { status: values.status } : {}),
    });
  }

  return (
    <Content className="p-6">
      <div className="mb-6 flex items-end justify-between">
        <Space orientation="vertical" size={4}>
          <Typography.Title level={2} className="!mb-0">
            {type?.dictName ?? dictType}
          </Typography.Title>
          <Typography.Text type="secondary">
            字典编码：<Typography.Text code>{type?.dictType ?? dictType}</Typography.Text>
          </Typography.Text>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增字典数据
        </Button>
      </div>

      <Card className="!mb-0">
        <Form form={searchForm} layout="inline" onFinish={submitSearch}>
          <Form.Item name="label" label="字典标签">
            <Input allowClear placeholder="模糊搜索" />
          </Form.Item>
          <Form.Item name="value" label="字典值">
            <Input allowClear placeholder="模糊搜索" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select allowClear options={statusOptions} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button
                onClick={() => {
                  searchForm.resetFields();
                  setQuery({ page: 1, pageSize: query.pageSize, dictType });
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="mt-4!">
        <Table<DictData>
          rowKey="id"
          loading={loading}
          dataSource={data}
          columns={[
            { title: '标签', dataIndex: 'label', key: 'label' },
            { title: '值', dataIndex: 'value', key: 'value' },
            { title: '排序', dataIndex: 'sort', key: 'sort', width: 90 },
            { title: '状态', dataIndex: 'status', key: 'status', render: statusTag },
            {
              title: '备注',
              dataIndex: 'remark',
              key: 'remark',
              ellipsis: true,
              render: (value: string | null) => value || '-',
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
              width: 190,
              render: (_: unknown, item: DictData) => (
                <Space>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(item)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="确认软删除此字典数据？"
                    onConfirm={() => void handleRemove(item)}
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
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

      <Modal
        title={editingData ? '编辑字典数据' : '新增字典数据'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form<DictDataFormValues>
          form={form}
          layout="vertical"
          onFinish={saveData}
          initialValues={{ sort: 0, status: 1 }}
        >
          <Form.Item label="字典编码">
            <Input value={type?.dictType ?? dictType} disabled />
          </Form.Item>
          <Form.Item
            name="label"
            label="字典标签"
            rules={[{ required: true, message: '请输入字典标签' }, { max: 100 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="value"
            label="字典值"
            rules={[{ required: true, message: '请输入字典值' }, { max: 100 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} precision={0} className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}

function statusTag(status: Status) {
  return <Tag color={status === 1 ? 'success' : 'default'}>{status === 1 ? '启用' : '停用'}</Tag>;
}
