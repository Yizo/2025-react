import { useState, useEffect } from 'react';
import { Layout, Table, Button, Space, Card, Tag, Select, DatePicker, Row, Col } from 'antd';
import { FileTextOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 日志数据类型
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  module: string;
  message: string;
  user?: string;
  ip?: string;
}

export default function LogManagement() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);

  // 模拟日志数据
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2024-02-09 10:30:25',
      level: 'info',
      module: '用户管理',
      message: '用户张三登录成功',
      user: '张三',
      ip: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: '2024-02-09 10:25:15',
      level: 'warning',
      module: '菜单管理',
      message: '尝试访问未授权的菜单项',
      user: '李四',
      ip: '192.168.1.101',
    },
    {
      id: '3',
      timestamp: '2024-02-09 10:20:05',
      level: 'error',
      module: '系统',
      message: '数据库连接超时',
      ip: '127.0.0.1',
    },
    {
      id: '4',
      timestamp: '2024-02-09 10:15:30',
      level: 'debug',
      module: '角色管理',
      message: '角色权限更新完成',
      user: '管理员',
      ip: '192.168.1.1',
    },
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setLoading(false);
    }, 500);
  };

  const handleSearch = () => {
    // 这里可以添加搜索逻辑
    setFilteredLogs(logs);
  };

  const handleExport = () => {
    // 这里可以添加导出逻辑
    console.log('导出日志');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'red';
      case 'warning':
        return 'orange';
      case 'info':
        return 'blue';
      case 'debug':
        return 'gray';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<LogEntry> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => <Tag color={getLevelColor(level)}>{level.toUpperCase()}</Tag>,
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 100,
      render: (user: string) => user || '-',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip: string) => ip || '-',
    },
  ];

  return (
    <Layout className="min-h-[calc(100vh-64px-70px)]">
      <Content className="p-6 ">
        <div className="mb-6">
          <h1 className="text-2xl font-bold  flex items-center">
            <FileTextOutlined className="mr-2" />
            系统日志
          </h1>
          <p className="mt-2">查看系统运行日志和操作记录</p>
        </div>

        {/* 筛选条件 */}
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Select placeholder="选择日志级别" style={{ width: '100%' }}>
                <Option value="">全部</Option>
                <Option value="error">错误</Option>
                <Option value="warning">警告</Option>
                <Option value="info">信息</Option>
                <Option value="debug">调试</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select placeholder="选择模块" style={{ width: '100%' }}>
                <Option value="">全部</Option>
                <Option value="用户管理">用户管理</Option>
                <Option value="菜单管理">菜单管理</Option>
                <Option value="角色管理">角色管理</Option>
                <Option value="部门管理">部门管理</Option>
                <Option value="字典管理">字典管理</Option>
                <Option value="系统">系统</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <RangePicker style={{ width: '100%' }} placeholder={['开始时间', '结束时间']} />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  搜索
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  导出
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 日志列表 */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </Content>
    </Layout>
  );
}
