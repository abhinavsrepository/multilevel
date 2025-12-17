import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Input, Space, Tag, Tooltip, Modal, message,
  Row, Col, Select, Slider, Statistic, Badge, Dropdown, Switch
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  StarOutlined,
  StarFilled,
  RocketOutlined,
  TeamOutlined,
  DollarOutlined,
  PercentageOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { propertyApi, Property } from '@/api/property.api';
import { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const { confirm } = Modal;
const { Option } = Select;

interface PropertyStats {
  totalProperties: number;
  totalInvestments: number;
  totalSlots: number;
  bookedSlots: number;
  avgROI: number;
}

const PropertiesList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Property[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState<PropertyStats>({
    totalProperties: 0,
    totalInvestments: 0,
    totalSlots: 0,
    bookedSlots: 0,
    avgROI: 0
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = async (page = 1, size = 10, search = '') => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: size,
      };

      // Add filters
      if (search) {
        params.location = search; // Use location filter for search
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (propertyTypeFilter) {
        params.propertyType = propertyTypeFilter;
      }
      // Only send price range if it's different from default
      if (priceRange[0] > 0 || priceRange[1] < 100000000) {
        params.minPrice = priceRange[0];
        params.maxPrice = priceRange[1];
      }

      const response = await propertyApi.getAll(params);
      if (response.data.success) {
        const properties = response.data.data || [];
        setData(properties);

        // Calculate stats
        const totalSlots = properties.reduce((sum: number, p: Property) => sum + (p.totalInvestmentSlots || 0), 0);
        const bookedSlots = properties.reduce((sum: number, p: Property) => sum + (p.slotsBooked || 0), 0);
        const avgROI = properties.length > 0
          ? properties.reduce((sum: number, p: Property) => sum + (p.expectedRoiPercent || 0), 0) / properties.length
          : 0;

        setStats({
          totalProperties: response.data.pagination?.total || properties.length,
          totalInvestments: properties.reduce((sum: number, p: Property) => sum + (p.basePrice || 0), 0),
          totalSlots,
          bookedSlots,
          avgROI
        });

        if (response.data.pagination) {
          setPagination({
            current: response.data.pagination.page,
            pageSize: size,
            total: response.data.pagination.total,
          });
        }
      } else {
        message.error(response.data.message || 'Failed to load properties');
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      message.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(pagination.current, pagination.pageSize, searchText);
  }, [statusFilter, propertyTypeFilter, priceRange]);

  const handleTableChange = (newPagination: any) => {
    fetchProperties(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleDelete = (id: number) => {
    confirm({
      title: 'Are you sure you want to delete this property?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      onOk: async () => {
        try {
          await propertyApi.delete(id);
          message.success('Property deleted successfully');
          fetchProperties(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
          message.error('Failed to delete property');
        }
      },
    });
  };

  const handleToggleFeatured = async (record: Property) => {
    try {
      await propertyApi.update(record.id!, { isFeatured: !record.isFeatured });
      message.success(`Property ${record.isFeatured ? 'unfeatured' : 'featured'} successfully`);
      fetchProperties(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      message.error('Failed to update property');
    }
  };

  const handleToggleNewLaunch = async (record: Property) => {
    try {
      await propertyApi.update(record.id!, { isNewLaunch: !record.isNewLaunch });
      message.success(`Property ${record.isNewLaunch ? 'removed from' : 'marked as'} new launch`);
      fetchProperties(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      message.error('Failed to update property');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await propertyApi.update(id, { status: status as any });
      message.success('Property status updated successfully');
      fetchProperties(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      message.error('Failed to update property status');
    }
  };

  const handleApplyFilters = () => {
    fetchProperties(1, pagination.pageSize, searchText);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setPropertyTypeFilter('');
    setPriceRange([0, 100000000]);
    setSearchText('');
    fetchProperties(1, pagination.pageSize, '');
  };

  const getActionMenu = (record: Property): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => navigate(`/properties/${record.id}`),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Property',
      onClick: () => navigate(`/properties/edit/${record.id}`),
    },
    {
      key: 'investors',
      icon: <TeamOutlined />,
      label: 'View Investors',
      onClick: () => navigate(`/properties/${record.id}/investors`),
    },
    { type: 'divider' },
    {
      key: 'featured',
      icon: record.isFeatured ? <StarFilled /> : <StarOutlined />,
      label: record.isFeatured ? 'Unfeature' : 'Feature',
      onClick: () => handleToggleFeatured(record),
    },
    {
      key: 'newLaunch',
      icon: <RocketOutlined />,
      label: record.isNewLaunch ? 'Remove New Launch' : 'Mark as New Launch',
      onClick: () => handleToggleNewLaunch(record),
    },
    { type: 'divider' },
    {
      key: 'status',
      label: 'Change Status',
      children: [
        {
          key: 'active',
          label: 'Active',
          onClick: () => handleStatusChange(record.id!, 'ACTIVE'),
        },
        {
          key: 'inactive',
          label: 'Inactive',
          onClick: () => handleStatusChange(record.id!, 'INACTIVE'),
        },
        {
          key: 'sold_out',
          label: 'Sold Out',
          onClick: () => handleStatusChange(record.id!, 'SOLD_OUT'),
        },
      ],
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => handleDelete(record.id!),
    },
  ];

  const columns: ColumnsType<Property> = [
    {
      title: 'Property',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      fixed: 'left',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <span style={{ fontWeight: 500 }}>{text}</span>
            {record.isFeatured && <Tag color="gold" icon={<StarFilled />}>Featured</Tag>}
            {record.isNewLaunch && <Tag color="blue" icon={<RocketOutlined />}>New</Tag>}
          </Space>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.propertyId} • {record.propertyType}
          </span>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.city}, {record.state}
          </span>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 150,
      sorter: true,
      render: (price) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>₹{price?.toLocaleString()}</span>
        </Space>
      ),
    },
    {
      title: 'Investment Slots',
      key: 'slots',
      width: 180,
      render: (_, record) => {
        const booked = record.slotsBooked || 0;
        const total = record.totalInvestmentSlots || 0;
        const percentage = total > 0 ? ((booked / total) * 100).toFixed(1) : 0;
        return (
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 500 }}>
              {booked} / {total}
            </span>
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {percentage}% filled
            </span>
          </Space>
        );
      },
    },
    {
      title: 'ROI & Commission',
      key: 'mlm',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '12px' }}>
            <PercentageOutlined /> ROI: {record.expectedRoiPercent || 0}% / {record.roiTenureMonths || 0}m
          </span>
          <span style={{ fontSize: '12px' }}>
            <DollarOutlined /> Comm: {record.directReferralCommissionPercent || 0}%
          </span>
          <span style={{ fontSize: '12px' }}>
            BV: {record.bvValue || 0}
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Active', value: 'ACTIVE' },
        { text: 'Inactive', value: 'INACTIVE' },
        { text: 'Sold Out', value: 'SOLD_OUT' },
        { text: 'Under Maintenance', value: 'UNDER_MAINTENANCE' },
      ],
      render: (status) => {
        let color = 'default';
        if (status === 'ACTIVE') color = 'success';
        if (status === 'INACTIVE') color = 'error';
        if (status === 'SOLD_OUT') color = 'warning';
        if (status === 'UNDER_MAINTENANCE') color = 'processing';
        return <Tag color={color}>{status.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Quick View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/properties/${record.id}`)}
            />
          </Tooltip>
          <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="properties-list-page" style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>Properties Management</h1>
          <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
            Manage MLM real estate investment properties
          </p>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/properties/add')}
              size="large"
            >
              Add Property
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Properties"
              value={stats.totalProperties}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Investment Value"
              value={stats.totalInvestments}
              prefix="₹"
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Investment Slots"
              value={stats.bookedSlots}
              suffix={`/ ${stats.totalSlots}`}
              valueStyle={{ color: '#cf1322' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
              {stats.totalSlots > 0 ? ((stats.bookedSlots / stats.totalSlots) * 100).toFixed(1) : 0}% filled
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Average ROI"
              value={stats.avgROI}
              suffix="%"
              precision={2}
              prefix={<PercentageOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      {showFilters && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Status</div>
              <Select
                style={{ width: '100%' }}
                placeholder="Select status"
                allowClear
                value={statusFilter || undefined}
                onChange={(value) => setStatusFilter(value || '')}
              >
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
                <Option value="SOLD_OUT">Sold Out</Option>
                <Option value="UNDER_MAINTENANCE">Under Maintenance</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Property Type</div>
              <Select
                style={{ width: '100%' }}
                placeholder="Select type"
                allowClear
                value={propertyTypeFilter || undefined}
                onChange={(value) => setPropertyTypeFilter(value || '')}
              >
                <Option value="RESIDENTIAL">Residential</Option>
                <Option value="COMMERCIAL">Commercial</Option>
                <Option value="VILLA">Villa</Option>
                <Option value="APARTMENT">Apartment</Option>
                <Option value="LAND">Land</Option>
                <Option value="PLOT">Plot</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              </div>
              <Slider
                range
                min={0}
                max={100000000}
                step={1000000}
                value={priceRange}
                onChange={(value) => setPriceRange(value as [number, number])}
                marks={{
                  0: '₹0',
                  25000000: '₹2.5Cr',
                  50000000: '₹5Cr',
                  75000000: '₹7.5Cr',
                  100000000: '₹10Cr',
                }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col>
              <Button type="primary" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </Col>
            <Col>
              <Button onClick={handleResetFilters}>Reset Filters</Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by location (city, state)..."
            prefix={<SearchOutlined />}
            style={{ width: 400 }}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={() => fetchProperties(1, pagination.pageSize, searchText)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default PropertiesList;
