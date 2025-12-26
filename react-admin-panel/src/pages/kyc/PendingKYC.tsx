import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  message,
  Typography,
  Tooltip,
  Image,
  Alert,
  Form
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { kycApi } from '../../api/kycApi';
import { KYCDocument } from '../../types/kyc.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PendingKYC: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KYCDocument[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Modal states
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const fetchRequests = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await kycApi.getPendingKYC({
        page,
        size: pageSize
      });

      if (response.data.success && response.data.data) {
        // Ensure data is always an array
        const kycData = Array.isArray(response.data.data) ? response.data.data : [];
        setData(kycData);
        if (response.data.pagination) {
          setPagination({
            current: response.data.pagination.page,
            pageSize: pageSize,
            total: response.data.pagination.total
          });
        }
      } else {
        setData([]); // Set empty array if no data
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch KYC requests');
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchRequests(pagination.current, pagination.pageSize);
  };

  const showReviewModal = (doc: KYCDocument, type: 'APPROVE' | 'REJECT') => {
    setSelectedDoc(doc);
    setActionType(type);
    setRejectionReason('');
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedDoc || !actionType) return;

    if (actionType === 'REJECT' && !rejectionReason.trim()) {
      message.error('Please provide a reason for rejection');
      return;
    }

    try {
      if (actionType === 'APPROVE') {
        await kycApi.approveKYC(selectedDoc.id);
      } else {
        await kycApi.rejectKYC(selectedDoc.id, rejectionReason);
      }

      message.success(`Document ${actionType.toLowerCase()}ed successfully`);
      setReviewModalVisible(false);
      fetchRequests(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const getDocumentName = (type: string) => {
    return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Assuming backend serves uploads at /uploads
    // Adjust base URL as needed based on your backend config
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://mlm-backend-ljan.onrender.com';
    // Remove 'src/' or 'public/' if present in path from backend
    const cleanPath = url.replace(/^src[\\/]/, '').replace(/^public[\\/]/, '');
    return `${baseUrl}/${cleanPath.replace(/\\/g, '/')}`;
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: KYCDocument) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.user?.fullName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.user?.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Document Type',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (text: string) => <Tag color="blue">{getDocumentName(text)}</Tag>,
    },
    {
      title: 'Document Number',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
      render: (text: string) => text || '-',
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Document',
      key: 'document',
      render: (_: any, record: KYCDocument) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setPreviewImage(getImageUrl(record.documentUrl));
              setPreviewVisible(true);
            }}
          >
            Front
          </Button>
          {record.backDocumentUrl && (
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setPreviewImage(getImageUrl(record.backDocumentUrl!));
                setPreviewVisible(true);
              }}
            >
              Back
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: KYCDocument) => (
        <Space>
          <Tooltip title="Approve">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="small"
              onClick={() => showReviewModal(record, 'APPROVE')}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="small"
              onClick={() => showReviewModal(record, 'REJECT')}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>Pending KYC Approvals</Title>
            <Text type="secondary">Review and verify user documents</Text>
          </div>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </Card>
      </Space>

      {/* Review Modal */}
      <Modal
        title={`${actionType === 'APPROVE' ? 'Approve Document' : 'Reject Document'}`}
        open={reviewModalVisible}
        onOk={handleReviewSubmit}
        onCancel={() => setReviewModalVisible(false)}
        okText={actionType === 'APPROVE' ? 'Approve' : 'Reject'}
        okButtonProps={{ danger: actionType === 'REJECT' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {actionType === 'APPROVE' ? (
            <Text>Are you sure you want to approve this document?</Text>
          ) : (
            <>
              <Alert message="Please provide a reason for rejection." type="warning" showIcon />
              <Form.Item label="Rejection Reason" required>
                <TextArea
                  rows={4}
                  placeholder="e.g., Image blurry, Details mismatch..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </Form.Item>
            </>
          )}
        </Space>
      </Modal>

      {/* Image Preview Modal */}
      <Image
        width={200}
        style={{ display: 'none' }}
        src={previewImage}
        preview={{
          visible: previewVisible,
          src: previewImage,
          onVisibleChange: (value) => {
            setPreviewVisible(value);
          },
        }}
      />
    </div>
  );
};

export default PendingKYC;
