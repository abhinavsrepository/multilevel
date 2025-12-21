import { useEffect, useState } from 'react';
import { Card, Row, Col, Input, Select, Slider, Button, Tag, Image, Typography, Space, Modal, Drawer, message } from 'antd';
import { SearchOutlined, FilterOutlined, SwapOutlined, EnvironmentOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { propertyApi } from '@/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setProperties, addToComparison, removeFromComparison, clearComparison } from '@/redux/slices/propertySlice';
import { Property } from '@/types/property.types';

const { Title, Text } = Typography;
const { Option } = Select;

export const PropertyDirectory = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    priceRange: [0, 1000000] as [number, number],
    availabilityStatus: '',
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { properties, comparisonList } = useAppSelector((state) => state.property);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyApi.search(searchText, filters);
      dispatch(setProperties(response.data.data || []));
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToComparison = (property: Property) => {
    if (comparisonList.length >= 4) {
      message.warning('You can compare up to 4 properties at a time');
      return;
    }
    dispatch(addToComparison(property));
    message.success('Added to comparison');
  };

  const handleRemoveFromComparison = (id: number) => {
    dispatch(removeFromComparison(id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Property Directory</Title>
        <Space>
          <Button
            icon={<SwapOutlined />}
            onClick={() => setCompareModalOpen(true)}
            disabled={comparisonList.length < 2}
          >
            Compare ({comparisonList.length})
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%' }} orientation="vertical">
          <Input
            size="large"
            placeholder="Search properties..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={fetchProperties}
          />
          <Space>
            <Select placeholder="Type" value={filters.type} onChange={(val) => setFilters({ ...filters, type: val })} style={{ width: 150 }} allowClear>
              <Option value="RESIDENTIAL">Residential</Option>
              <Option value="COMMERCIAL">Commercial</Option>
              <Option value="PLOT">Plot</Option>
              <Option value="VILLA">Villa</Option>
              <Option value="APARTMENT">Apartment</Option>
            </Select>
            <Select
              placeholder="Location"
              value={filters.location}
              onChange={(val) => setFilters({ ...filters, location: val })}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="New York">New York</Option>
              <Option value="Los Angeles">Los Angeles</Option>
              <Option value="Chicago">Chicago</Option>
            </Select>
            <Select
              placeholder="Status"
              value={filters.availabilityStatus}
              onChange={(val) => setFilters({ ...filters, availabilityStatus: val })}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="AVAILABLE">Available</Option>
              <Option value="RESERVED">Reserved</Option>
              <Option value="SOLD">Sold</Option>
            </Select>
            <Button type="primary" onClick={fetchProperties}>Search</Button>
          </Space>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {properties.map((property) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={property.id}>
            <Card
              hoverable
              cover={
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <Image
                    src={property.images?.[0] || 'https://via.placeholder.com/400x200'}
                    alt={property.title}
                    style={{ width: '100%', height: 200, objectFit: 'cover' }}
                    preview={false}
                  />
                </div>
              }
              actions={[
                <Button size="small" onClick={() => navigate(`/properties/${property.id}`)}>View Details</Button>,
                <Button size="small" onClick={() => handleAddToComparison(property)}>Add to Compare</Button>,
              ]}
            >
              <div>
                <Title level={5} style={{ marginBottom: 8 }}>{property.title}</Title>
                <Space orientation="vertical" style={{ width: '100%' }}>
                  <Text type="secondary">
                    <EnvironmentOutlined /> {property.location}, {property.city}
                  </Text>
                  <Text strong style={{ fontSize: 18, color: '#1890ff' }}>${(property.price || 0).toLocaleString()}</Text>
                  <div>
                    <Tag color={property.availabilityStatus === 'AVAILABLE' ? 'green' : property.availabilityStatus === 'RESERVED' ? 'orange' : 'red'}>
                      {property.availabilityStatus}
                    </Tag>
                    <Tag>{property.type}</Tag>
                  </div>
                  <Text type="secondary">{property.area} {property.areaUnit}</Text>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Comparison Modal */}
      <Modal
        title="Property Comparison"
        open={compareModalOpen}
        onCancel={() => setCompareModalOpen(false)}
        footer={[
          <Button key="clear" onClick={() => dispatch(clearComparison())}>Clear All</Button>,
          <Button key="close" type="primary" onClick={() => setCompareModalOpen(false)}>Close</Button>,
        ]}
        width={1000}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Feature</th>
              {comparisonList.map((prop) => (
                <th key={prop.id}>
                  {prop.title}
                  <Button size="small" type="link" onClick={() => handleRemoveFromComparison(prop.id)}>Remove</Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Price</strong></td>
              {comparisonList.map((prop) => <td key={prop.id}>${(prop.price || 0).toLocaleString()}</td>)}
            </tr>
            <tr>
              <td><strong>Location</strong></td>
              {comparisonList.map((prop) => <td key={prop.id}>{prop.location}, {prop.city}</td>)}
            </tr>
            <tr>
              <td><strong>Area</strong></td>
              {comparisonList.map((prop) => <td key={prop.id}>{prop.area} {prop.areaUnit}</td>)}
            </tr>
            <tr>
              <td><strong>Type</strong></td>
              {comparisonList.map((prop) => <td key={prop.id}>{prop.type}</td>)}
            </tr>
            <tr>
              <td><strong>Status</strong></td>
              {comparisonList.map((prop) => <td key={prop.id}><Tag color={prop.availabilityStatus === 'AVAILABLE' ? 'green' : 'orange'}>{prop.availabilityStatus}</Tag></td>)}
            </tr>
          </tbody>
        </table>
      </Modal>
    </div>
  );
};
