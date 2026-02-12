import { App } from 'antd';
import {
  getDictionaryTypeList,
  fetchAddDictionaryType,
  fetchEditDictionaryType,
  fetchDeleteDictionaryType,
} from './api';
import { cleanObject } from '@/utils/util';
import type { ChildProps } from './types';

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
  { label: '全部', value: null },
];

function useSearch() {
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
      sort: sort ? (sort === 'ascend' ? 'asc' : 'desc') : undefined,
      ...formData,
    };
    return getDictionaryTypeList(queryParams).then((res) => {
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
  record,
  onClose,
}: {
  open: boolean;
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
          name: values.name,
          status: values.status,
          description: values.description,
        });
        await fetchEditDictionaryType(data);
      } else {
        await fetchAddDictionaryType(values);
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
      title={record ? '编辑字典类型' : '新增字典类型'}
      loading={loading}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className="pt-4!">
        <Form form={form} layout="horizontal" labelCol={{ span: 4 }}>
          <Form.Item
            name="name"
            label="类型名称"
            rules={[
              { required: true, message: '请输入类型名称' },
              { max: 10, message: '类型名称长度为1-10位' },
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
          <Form.Item
            name="description"
            label="描述"
            rules={[{ max: 100, message: '描述长度为1-100位' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default function TypeList(props: ChildProps) {
  const { ref, toggle } = props;
  const {
    form,
    result: { tableProps, search, ...searchRest },
  } = useSearch();
  const { sorter = null } = (searchRest.params[0] as any) || {};

  const columns = [
    {
      title: '字典名称',
      dataIndex: 'name',
      key: 'name',
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
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => {
        return (
          <Tooltip title={description}>
            <span className="truncate line-clamp-2 max-w-[300px]">{description}</span>
          </Tooltip>
        );
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
      width: 150,
      render: (_: any, record: any) => {
        return (
          <div className="flex items-center gap-2!">
            <Button type="link" onClick={() => onEdit(record)} className="mx-0! p-0!">
              编辑
            </Button>
            <Button type="link" onClick={() => onView(record)} className="mx-0! p-0!">
              查看
            </Button>
            <Popconfirm title="确定删除这个字典类型吗？" onConfirm={() => onDelete(record)}>
              <Button type="link" danger className="mx-0! p-0!">
                删除
              </Button>
            </Popconfirm>
          </div>
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
    console.log('新增字典类型');
    setOpen(true);
  }
  function onEdit(record: any) {
    setRecord(record);
    setOpen(true);
  }
  function onView(record: any) {
    console.log('查看字典类型', record);
    toggle(record.id);
  }
  function onDelete(record: any) {
    fetchDeleteDictionaryType(record.id).then(() => {
      message.success('删除成功');
      search.submit();
    });
  }
  useImperativeHandle(ref, () => ({
    onAdd,
  }));
  return (
    <div>
      <Card>
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
      <TypeModal open={open} record={record} onClose={onModalClose} />
    </div>
  );
}
