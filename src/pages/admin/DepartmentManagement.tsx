import { useEffect, useMemo, useState } from 'react';
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
import { ApartmentOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/date.util';
import {
  createDepartment,
  getDepartments,
  removeDepartment,
  updateDepartment,
  type Department,
  type DepartmentQuery,
  type Status,
} from './api';
import LazyDepartmentTreeSelect from './components/LazyDepartmentTreeSelect';

const { Content } = Layout;

const statusOptions: { label: string; value: Status }[] = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

interface DepartmentFormValues {
  deptName: string;
  parentId: number | null;
  sort: number;
  status: Status;
}

function collectDescendantIds(items: Department[], id: number): Set<number> {
  const descendants = new Set<number>();
  const queue = items.filter((item) => item.parentId === id).map((item) => item.id);
  while (queue.length) {
    const current = queue.shift();
    if (current === undefined || descendants.has(current)) continue;
    descendants.add(current);
    queue.push(...items.filter((item) => item.parentId === current).map((item) => item.id));
  }
  return descendants;
}

function buildLoadedTree(
  items: Department[],
  childrenByParent: Map<number, Department[]>
): Department[] {
  return items.map((item) => {
    const children = childrenByParent.get(item.id);
    return {
      ...item,
      ...(children ? { children: buildLoadedTree(children, childrenByParent) } : {}),
    };
  });
}

export default function DepartmentManagement() {
  const { message } = App.useApp();
  const [query, setQuery] = useState<DepartmentQuery>({ page: 1, pageSize: 100 });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [childrenLoading, setChildrenLoading] = useState<Set<number>>(new Set());
  const [childrenByParent, setChildrenByParent] = useState<Map<number, Department[]>>(new Map());
  const [loadedParentIds, setLoadedParentIds] = useState<Set<number>>(new Set());
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department>();
  const [searchForm] = Form.useForm<DepartmentQuery>();
  const [form] = Form.useForm<DepartmentFormValues>();

  useEffect(() => {
    let active = true;
    setChildrenByParent(new Map());
    setLoadedParentIds(new Set());
    setExpandedRowKeys([]);
    setLoading(true);
    getDepartments(query)
      .then((response) => {
        if (!active) return;
        setDepartments(response.data.items);
        setTotal(response.data.total);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const treeData = useMemo(() => {
    const topLevel =
      query.parentId === undefined
        ? departments.filter((department) => department.parentId === null)
        : departments;
    return buildLoadedTree(topLevel, childrenByParent);
  }, [childrenByParent, departments, query.parentId]);
  const excludedParentIds = useMemo(() => {
    const excluded = editingDepartment
      ? new Set([editingDepartment.id, ...collectDescendantIds(departments, editingDepartment.id)])
      : new Set<number>();
    return excluded;
  }, [departments, editingDepartment]);

  async function loadDepartmentChildren(expanded: boolean, department: Department) {
    setExpandedRowKeys((current) =>
      expanded
        ? [...new Set([...current, department.id])]
        : current.filter((id) => id !== department.id)
    );
    if (!expanded || loadedParentIds.has(department.id)) return;

    setChildrenLoading((current) => new Set(current).add(department.id));
    try {
      const response = await getDepartments({
        page: 1,
        pageSize: 100,
        parentId: department.id,
        ...(query.status !== undefined ? { status: query.status } : {}),
      });
      setChildrenByParent((current) => {
        const next = new Map(current);
        next.set(department.id, response.data.items);
        return next;
      });
      setLoadedParentIds((current) => new Set(current).add(department.id));
    } finally {
      setChildrenLoading((current) => {
        const next = new Set(current);
        next.delete(department.id);
        return next;
      });
    }
  }

  function openCreate() {
    setEditingDepartment(undefined);
    form.resetFields();
    form.setFieldsValue({ parentId: null, sort: 0, status: 1 });
    setModalOpen(true);
  }

  function openEdit(department: Department) {
    setEditingDepartment(department);
    form.setFieldsValue({
      deptName: department.deptName,
      parentId: department.parentId,
      sort: department.sort,
      status: department.status,
    });
    setModalOpen(true);
  }

  async function saveDepartment(values: DepartmentFormValues) {
    const payload = {
      deptName: values.deptName,
      parentId: values.parentId ?? null,
      sort: values.sort ?? 0,
      status: values.status,
    };
    if (editingDepartment) {
      await updateDepartment(editingDepartment.id, payload);
      message.success('部门更新成功');
    } else {
      await createDepartment(payload);
      message.success('部门创建成功');
    }
    setModalOpen(false);
    setQuery((current) => ({ ...current, page: 1 }));
  }

  async function handleRemove(department: Department) {
    await removeDepartment(department.id);
    message.success('部门已删除');
    setQuery((current) => ({ ...current, page: 1 }));
  }

  function submitSearch(values: Partial<DepartmentQuery>) {
    setQuery({
      page: 1,
      pageSize: query.pageSize,
      ...(values.deptName ? { deptName: values.deptName.trim() } : {}),
      ...(values.parentId !== undefined ? { parentId: values.parentId } : {}),
      ...(values.status !== undefined ? { status: values.status } : {}),
    });
  }

  function resetSearch() {
    searchForm.resetFields();
    setQuery({ page: 1, pageSize: query.pageSize });
  }

  return (
    <Content className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Typography.Title level={2} className="!mb-1">
            <ApartmentOutlined className="mr-2" />
            部门管理
          </Typography.Title>
          <Typography.Text type="secondary">维护组织层级、排序和部门状态</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增部门
        </Button>
      </div>

      <Card className="!mb-0">
        <Form form={searchForm} layout="inline" onFinish={submitSearch}>
          <Form.Item name="deptName" label="部门名称">
            <Input allowClear placeholder="模糊搜索" />
          </Form.Item>
          <Form.Item name="parentId" label="父部门">
            <LazyDepartmentTreeSelect placeholder="全部" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select allowClear options={statusOptions} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={resetSearch}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="mt-4!">
        <Table<Department>
          rowKey="id"
          loading={loading || childrenLoading.size > 0}
          dataSource={treeData}
          expandable={{
            expandedRowKeys,
            onExpand: (expanded, department) => void loadDepartmentChildren(expanded, department),
            rowExpandable: (department) =>
              departments.some((item) => item.parentId === department.id) ||
              childrenByParent.has(department.id),
          }}
          columns={[
            { title: '部门名称', dataIndex: 'deptName', key: 'deptName' },
            {
              title: '祖级路径',
              dataIndex: 'ancestors',
              key: 'ancestors',
              render: (value: string) => value || '根部门',
            },
            { title: '排序', dataIndex: 'sort', key: 'sort', width: 90 },
            { title: '状态', dataIndex: 'status', key: 'status', render: statusTag },
            {
              title: '更新时间',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              render: (value: string) => formatDate(value),
            },
            {
              title: '操作',
              key: 'actions',
              width: 150,
              render: (_: unknown, department: Department) => (
                <Space>
                  <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(department)}>
                    编辑
                  </Button>
                  <Popconfirm
                    title="确认软删除此部门？"
                    description="存在有效子部门或关联用户时后端会拒绝删除。"
                    onConfirm={() => handleRemove(department)}
                  >
                    <Button type="link" danger>
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
            showSizeChanger: false,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (page) => setQuery((current) => ({ ...current, page })),
          }}
        />
      </Card>

      <Modal
        title={editingDepartment ? '编辑部门' : '新增部门'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form<DepartmentFormValues>
          form={form}
          layout="vertical"
          onFinish={saveDepartment}
          initialValues={{ parentId: null, sort: 0, status: 1 }}
        >
          <Form.Item
            name="deptName"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }, { max: 100 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="parentId" label="父部门">
            <LazyDepartmentTreeSelect placeholder="根部门" excludeIds={excludedParentIds} />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} precision={0} className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}

function statusTag(status: Status) {
  return <Tag color={status === 1 ? 'success' : 'default'}>{status === 1 ? '启用' : '停用'}</Tag>;
}
