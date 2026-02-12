import { App } from 'antd';
import { useSearchParams } from 'react-router';
import {
  getDictionaryDataList,
  fetchAddDictionaryData,
  fetchEditDictionaryData,
  fetchDeleteDictionaryData,
} from './api';
import { cleanObject } from '@/utils/util';
import type { ChildProps } from './types';

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
  { label: '全部', value: null },
];

function useSearch(typeId: number | null) {
  const [form] = Form.useForm();
  const result = useAntdTable(getTableData, {
    form,
    defaultParams: [
      {
        current: 1,
        pageSize: 10,
        total: 0,
      },
    ],
  });
  const { tableProps } = result;
  Object.assign(tableProps, {
    pagination: {
      ...tableProps.pagination,
      ...tableConfig.pagination,
    },
  });

  function getTableData(...args: Record<string, any>[]) {
    const [pagination, formData] = args;
    const { current, pageSize, sorter } = pagination;
    console.log('sorter', sorter);
    const sort = Array.isArray(sorter) ? undefined : sorter?.order;
    const queryParams = {
      page: current,
      pageSize,
      typeId,
      sort: sort ? (sort === 'ascend' ? 'asc' : 'desc') : undefined,
      ...formData,
    };
    return getDictionaryDataList(queryParams).then((res) => {
      return {
        list: res.data,
        total: res.total,
      };
    });
  }
  return {
    form,
    result,
  };
}

function TypeModal({
  open,
  typeId,
  record,
  onClose,
}: {
  open: boolean;
  typeId: number | null;
  record?: any;
  onClose: (refresh?: boolean) => void;
}) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  async function handleOk() {
    if (loading) return;
    setLoading(true);
    const values = await form.validateFields();
    try {
      if (record) {
        const data = cleanObject({
          id: record.id,
          typeId,
          name: values.name,
          value: values.value,
          status: values.status,
          sortOrder: values.sortOrder,
        });
        await fetchEditDictionaryData(data);
      } else {
        await fetchAddDictionaryData({ ...values, typeId });
      }
      message.success(record ? '编辑成功' : '新增成功');
      onClose(true);
    } finally {
      setLoading(false);
    }
  }
  function handleCancel() {
    form.resetFields();
    onClose();
  }

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: 1,
      });
    }
    return () => {
      form.resetFields();
    };
  }, [record, open]);
  return (
    <Modal
      title={record ? '编辑字典数据' : '新增字典数据'}
      loading={loading}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className="pt-4!">
        <Form form={form} layout="horizontal" labelCol={{ span: 4 }}>
          <Form.Item
            name="name"
            label="字典名称"
            rules={[
              { required: true, message: '请输入字典名称' },
              { max: 10, message: '字典名称长度为1-10位' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="value"
            label="字典值"
            rules={[
              { required: true, message: '请输入字典值' },
              { max: 100, message: '字典值长度为1-100位' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="status" label="类型状态">
            <Select
              placeholder="请选择类型状态"
              options={statusOptions.filter((item) => item.value !== null)}
            />
          </Form.Item>
          <Form.Item name="sortOrder" label="字典顺序">
            <InputNumber min={0} styles={{ root: { width: '100%' } }} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default function DataList(props: ChildProps) {
  const { ref, toggle } = props;
  const [searchParams] = useSearchParams();
  const typeId = useMemo(() => {
    const typeId = searchParams.get('typeId');
    return typeId !== null ? parseInt(typeId) : null;
  }, [searchParams]);
  const {
    form,
    result: { tableProps, search, ...searchRest },
  } = useSearch(typeId);
  const { sorter = null } = (searchRest.params[0] as any) || {};

  const columns = [
    {
      title: '字典名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '字典值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: () => {
        return (
          <div>
            <span>字典顺序</span>
            <Tooltip title="数字越小，排序越靠前">
              <ExclamationCircleOutlined className="ml-2 cursor-pointer" />
            </Tooltip>
          </div>
        );
      },
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusNum = parseInt(status);
        if (statusNum === 1) {
          return (
            <Tag color="green" variant="outlined">
              启用
            </Tag>
          );
        } else if (statusNum === 0) {
          return (
            <Tag color="red" variant="outlined">
              禁用
            </Tag>
          );
        } else {
          return (
            <Tag color="orange" variant="outlined">
              未知
            </Tag>
          );
        }
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      sortOrder: sorter && sorter.order,
      render: (updatedAt: string) => {
        return formatDate(updatedAt);
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => {
        return (
          <Space>
            <Button type="link" onClick={() => onEdit(record)} className="mx-0! p-0!">
              编辑
            </Button>
            <Popconfirm title="确定删除这个字典数据吗？" onConfirm={() => onDelete(record)}>
              <Button type="link" danger className="mx-0! p-0!">
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<any>(null);
  function onModalClose(refresh?: boolean) {
    setOpen(false);
    setRecord(null);
    if (refresh) {
      search.submit();
    }
  }
  function onAdd() {
    setOpen(true);
  }
  function onEdit(record: any) {
    setRecord(record);
    setOpen(true);
  }
  function onDelete(record: any) {
    fetchDeleteDictionaryData({ id: record.id, typeId }).then(() => {
      message.success('删除成功');
      search.submit();
    });
  }
  useImperativeHandle(ref, () => ({
    onAdd,
  }));
  return (
    <div>
      <Card className="flex items-center justify-between">
        <Form form={form} layout="inline" className="space-y-2!">
          <Form.Item name="name" label="类型名称">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="类型状态">
            <Select
              placeholder="请选择类型状态"
              options={statusOptions}
              className="min-w-[180px]"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={search.submit}>
              查询
            </Button>
          </Form.Item>

          <Form.Item>
            <Button onClick={search.reset}>重置</Button>
          </Form.Item>
        </Form>
      </Card>
      <Card className="mt-4!">
        <Table columns={columns} rowKey="id" {...tableProps} />
      </Card>
      <TypeModal typeId={typeId} open={open} record={record} onClose={onModalClose} />
    </div>
  );
}
