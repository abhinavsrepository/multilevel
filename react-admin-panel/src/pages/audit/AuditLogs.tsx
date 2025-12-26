import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, DatePicker, Input, Button, Modal, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { auditApi, AuditLog } from '@/api/auditApi';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const AuditLogs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({
    userId: undefined as number | undefined,
    action: '',
    startDate: '',
    endDate: '',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchLogs = async (page = 1, size = 20) => {
    setLoading(true);
    try {
      const response = await auditApi.getAuditLogs({
        page,
        limit: size,
        ...filters,
      });
      if (response.data.success) {
        setLogs(response.data.data);
        if (response.data.pagination) {
          setPagination({
            current: response.data.pagination.currentPage,
            pageSize: size,
            total: response.data.pagination.totalItems,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchLogs(1, pagination.pageSize);
  };

  const handleReset = () => {
    setFilters({ userId: undefined, action: '', startDate: '', endDate: '' });
    setPagination({ ...pagination, current: 1 });
    // Need to trigger fetch after state update, or call fetch with empty filters directly
    setTimeout(() => fetchLogs(1, pagination.pageSize), 0);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: AuditLog) => (
        <Space direction="vertical" size={0}>
          <span>{record.User?.username || 'Unknown'}</span>
          <Tag color={record.User?.role === 'ADMIN' ? 'red' : 'blue'}>{record.User?.role || 'N/A'}</Tag>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => <Tag color="geekblue">{action}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AuditLog) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            setSelectedLog(record);
            setModalVisible(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="Audit Logs" extra={<Button icon={<ReloadOutlined />} onClick={() => fetchLogs(pagination.current, pagination.pageSize)}>Refresh</Button>}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="User ID"
            style={{ width: 120 }}
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            placeholder="Action"
            style={{ width: 150 }}
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          />
          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setFilters({
                  ...filters,
                  startDate: dates[0]?.toISOString() || '',
                  endDate: dates[1]?.toISOString() || '',
                });
              } else {
                setFilters({ ...filters, startDate: '', endDate: '' });
              }
            }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Search
          </Button>
          <Button onClick={handleReset}>Reset</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, size) => setPagination({ ...pagination, current: page, pageSize: size }),
          }}
        />
      </Card>

      <Modal
        title="Audit Log Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="Date">{dayjs(selectedLog.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="User">{selectedLog.User?.username} ({selectedLog.User?.email})</Descriptions.Item>
            <Descriptions.Item label="Role">{selectedLog.User?.role}</Descriptions.Item>
            <Descriptions.Item label="Action">{selectedLog.action}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedLog.description}</Descriptions.Item>
            <Descriptions.Item label="IP Address">{selectedLog.ipAddress}</Descriptions.Item>
            <Descriptions.Item label="User Agent">{selectedLog.userAgent}</Descriptions.Item>
            <Descriptions.Item label="Metadata">
              <pre style={{ maxHeight: 200, overflow: 'auto' }}>
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
