import { useState, useEffect } from 'react';
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Card,
  Tabs,
  Tag,
  InputNumber,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// 字典类型数据类型
interface DictType {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  sort: number;
  createTime: string;
  updateTime: string;
}

// 字典数据类型
interface DictData {
  id: string;
  typeId: string;
  label: string;
  value: string;
  description?: string;
  sort: number;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime: string;
}

export default function DictionaryManagement() {
  const [dictTypes, setDictTypes] = useState<DictType[]>([]);
  const [dictData, setDictData] = useState<DictData[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [isDataModalVisible, setIsDataModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<DictType | null>(null);
  const [editingData, setEditingData] = useState<DictData | null>(null);
  const [loading, setLoading] = useState(false);
  const [typeForm] = Form.useForm();
  const [dataForm] = Form.useForm();

  // 模拟字典类型数据
  const mockDictTypes: DictType[] = [
    {
      id: '1',
      name: '性别',
      code: 'gender',
      description: '用户性别选项',
      status: 'active',
      sort: 1,
      createTime: '2024-01-01',
      updateTime: '2024-02-09',
    },
    {
      id: '2',
      name: '状态',
      code: 'status',
      description: '通用状态选项',
      status: 'active',
      sort: 2,
      createTime: '2024-01-01',
      updateTime: '2024-02-09',
    },
    {
      id: '3',
      name: '优先级',
      code: 'priority',
      description: '任务优先级选项',
      status: 'active',
      sort: 3,
      createTime: '2024-01-15',
      updateTime: '2024-02-01',
    },
  ];

  // 模拟字典数据
  const mockDictData: DictData[] = [
    // 性别
    {
      id: '1',
      typeId: '1',
      label: '男',
      value: 'male',
      description: '男性',
      sort: 1,
      status: 'active',
      createTime: '2024-01-01',
      updateTime: '2024-01-01',
    },
    {
      id: '2',
      typeId: '1',
      label: '女',
      value: 'female',
      description: '女性',
      sort: 2,
      status: 'active',
      createTime: '2024-01-01',
      updateTime: '2024-01-01',
    },
    // 状态
    {
      id: '3',
      typeId: '2',
      label: '启用',
      value: 'active',
      description: '正常启用状态',
      sort: 1,
      status: 'active',
      createTime: '2024-01-01',
      updateTime: '2024-01-01',
    },
    {
      id: '4',
      typeId: '2',
      label: '禁用',
      value: 'inactive',
      description: '禁用状态',
      sort: 2,
      status: 'active',
      createTime: '2024-01-01',
      updateTime: '2024-01-01',
    },
    // 优先级
    {
      id: '5',
      typeId: '3',
      label: '高',
      value: 'high',
      description: '高优先级',
      sort: 1,
      status: 'active',
      createTime: '2024-01-15',
      updateTime: '2024-01-15',
    },
    {
      id: '6',
      typeId: '3',
      label: '中',
      value: 'medium',
      description: '中优先级',
      sort: 2,
      status: 'active',
      createTime: '2024-01-15',
      updateTime: '2024-01-15',
    },
    {
      id: '7',
      typeId: '3',
      label: '低',
      value: 'low',
      description: '低优先级',
      sort: 3,
      status: 'active',
      createTime: '2024-01-15',
      updateTime: '2024-01-15',
    },
  ];

  useEffect(() => {
    fetchDictTypes();
    fetchDictData();
  }, []);

  const fetchDictTypes = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setDictTypes(mockDictTypes);
      setLoading(false);
    }, 500);
  };

  const fetchDictData = async () => {
    // 模拟API调用
    setTimeout(() => {
      setDictData(mockDictData);
    }, 300);
  };

  // 字典类型管理
  const handleAddType = () => {
    setEditingType(null);
    typeForm.resetFields();
    typeForm.setFieldsValue({ status: 'active', sort: 1 });
    setIsTypeModalVisible(true);
  };

  const handleEditType = (type: DictType) => {
    setEditingType(type);
    typeForm.setFieldsValue({
      name: type.name,
      code: type.code,
      description: type.description,
      status: type.status,
      sort: type.sort,
    });
    setIsTypeModalVisible(true);
  };

  const handleDeleteType = async (id: string) => {
    // 这里应该调用删除API
    setDictTypes(dictTypes.filter((type) => type.id !== id));
    // 同时删除对应的字典数据
    setDictData(dictData.filter((data) => data.typeId !== id));
    message.success('删除成功');
  };

  const handleTypeModalOk = async () => {
    try {
      const values = await typeForm.validateFields();
      if (editingType) {
        // 编辑
        setDictTypes(
          dictTypes.map((type) =>
            type.id === editingType.id
              ? {
                  ...type,
                  ...values,
                  updateTime: new Date().toISOString().split('T')[0],
                }
              : type
          )
        );
        message.success('编辑成功');
      } else {
        // 新增
        const newType: DictType = {
          id: Date.now().toString(),
          ...values,
          createTime: new Date().toISOString().split('T')[0],
          updateTime: new Date().toISOString().split('T')[0],
        };
        setDictTypes([...dictTypes, newType]);
        message.success('新增成功');
      }
      setIsTypeModalVisible(false);
      typeForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 字典数据管理
  const handleAddData = () => {
    if (!selectedTypeId) {
      message.warning('请先选择字典类型');
      return;
    }
    setEditingData(null);
    dataForm.resetFields();
    dataForm.setFieldsValue({ typeId: selectedTypeId, status: 'active', sort: 1 });
    setIsDataModalVisible(true);
  };

  const handleEditData = (data: DictData) => {
    setEditingData(data);
    dataForm.setFieldsValue({
      typeId: data.typeId,
      label: data.label,
      value: data.value,
      description: data.description,
      sort: data.sort,
      status: data.status,
    });
    setIsDataModalVisible(true);
  };

  const handleDeleteData = async (id: string) => {
    // 这里应该调用删除API
    setDictData(dictData.filter((data) => data.id !== id));
    message.success('删除成功');
  };

  const handleDataModalOk = async () => {
    try {
      const values = await dataForm.validateFields();
      if (editingData) {
        // 编辑
        setDictData(
          dictData.map((data) =>
            data.id === editingData.id
              ? {
                  ...data,
                  ...values,
                  updateTime: new Date().toISOString().split('T')[0],
                }
              : data
          )
        );
        message.success('编辑成功');
      } else {
        // 新增
        const newData: DictData = {
          id: Date.now().toString(),
          ...values,
          createTime: new Date().toISOString().split('T')[0],
          updateTime: new Date().toISOString().split('T')[0],
        };
        setDictData([...dictData, newData]);
        message.success('新增成功');
      }
      setIsDataModalVisible(false);
      dataForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const typeColumns: ColumnsType<DictType> = [
    {
      title: '字典名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '字典编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '数据项数量',
      key: 'dataCount',
      render: (_, record) => {
        const count = dictData.filter((data) => data.typeId === record.id).length;
        return count;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditType(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个字典类型吗？"
            onConfirm={() => handleDeleteType(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dataColumns: ColumnsType<DictData> = [
    {
      title: '标签',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditData(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个字典数据吗？"
            onConfirm={() => handleDeleteData(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredDictData = selectedTypeId
    ? dictData.filter((data) => data.typeId === selectedTypeId)
    : [];

  return (
    <Layout className="min-h-[calc(100vh-64px-70px)]">
      <Content className="p-6 ">
        <div className="mb-6">
          <h1 className="text-2xl font-bold  flex items-center">
            <BookOutlined className="mr-2" />
            字典管理
          </h1>
          <p className="mt-2">管理系统字典类型和键值对数据</p>
        </div>

        <Card className="shadow-sm">
          <Tabs defaultActiveKey="types" type="card">
            <TabPane tab="字典类型" key="types">
              <div className="mb-4 flex justify-end">
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddType}>
                  新增字典类型
                </Button>
              </div>
              <Table
                columns={typeColumns}
                dataSource={dictTypes}
                rowKey="id"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                }}
              />
            </TabPane>

            <TabPane tab="字典数据" key="data">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <span className="mr-2">选择字典类型:</span>
                  <Select
                    style={{ width: 200 }}
                    placeholder="请选择字典类型"
                    value={selectedTypeId}
                    onChange={setSelectedTypeId}
                  >
                    {dictTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.name} ({type.code})
                      </Option>
                    ))}
                  </Select>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddData}
                  disabled={!selectedTypeId}
                >
                  新增字典数据
                </Button>
              </div>
              <Table
                columns={dataColumns}
                dataSource={filteredDictData}
                rowKey="id"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                }}
                locale={{
                  emptyText: selectedTypeId ? '暂无数据' : '请先选择字典类型',
                }}
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* 字典类型模态框 */}
        <Modal
          title={editingType ? '编辑字典类型' : '新增字典类型'}
          open={isTypeModalVisible}
          onOk={handleTypeModalOk}
          onCancel={() => {
            setIsTypeModalVisible(false);
            typeForm.resetFields();
          }}
          width={600}
        >
          <Form
            form={typeForm}
            layout="vertical"
            initialValues={{
              status: 'active',
              sort: 1,
            }}
          >
            <Form.Item
              name="name"
              label="字典名称"
              rules={[{ required: true, message: '请输入字典名称' }]}
            >
              <Input placeholder="请输入字典名称" />
            </Form.Item>

            <Form.Item
              name="code"
              label="字典编码"
              rules={[
                { required: true, message: '请输入字典编码' },
                { pattern: /^[a-z_]+$/, message: '字典编码只能包含小写字母和下划线' },
              ]}
            >
              <Input placeholder="请输入字典编码" disabled={!!editingType} />
            </Form.Item>

            <Form.Item name="description" label="描述">
              <TextArea placeholder="请输入字典描述" rows={3} />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="sort"
              label="排序"
              rules={[{ required: true, message: '请输入排序号' }]}
            >
              <InputNumber min={1} placeholder="请输入排序号" style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* 字典数据模态框 */}
        <Modal
          title={editingData ? '编辑字典数据' : '新增字典数据'}
          open={isDataModalVisible}
          onOk={handleDataModalOk}
          onCancel={() => {
            setIsDataModalVisible(false);
            dataForm.resetFields();
          }}
          width={600}
        >
          <Form
            form={dataForm}
            layout="vertical"
            initialValues={{
              status: 'active',
              sort: 1,
            }}
          >
            <Form.Item
              name="typeId"
              label="字典类型"
              rules={[{ required: true, message: '请选择字典类型' }]}
            >
              <Select placeholder="请选择字典类型" disabled>
                {dictTypes.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.name} ({type.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="label"
              label="标签"
              rules={[{ required: true, message: '请输入标签' }]}
            >
              <Input placeholder="请输入显示标签" />
            </Form.Item>

            <Form.Item name="value" label="值" rules={[{ required: true, message: '请输入值' }]}>
              <Input placeholder="请输入数据值" />
            </Form.Item>

            <Form.Item name="description" label="描述">
              <TextArea placeholder="请输入数据描述" rows={3} />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="sort"
              label="排序"
              rules={[{ required: true, message: '请输入排序号' }]}
            >
              <InputNumber min={1} placeholder="请输入排序号" style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
