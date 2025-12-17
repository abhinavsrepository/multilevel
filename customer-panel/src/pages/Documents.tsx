import { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Upload, message, Typography, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { documentApi } from '@/api';
import { Document } from '@/types/document.types';

const { Title } = Typography;

export const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentApi.getAll();
      setDocuments(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await documentApi.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to download document');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Uploaded', dataIndex: 'uploadedAt', key: 'uploadedAt' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Document) => (
        <Space>
          <Button icon={<DownloadOutlined />} size="small" onClick={() => handleDownload(record.id)}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Document Vault</Title>
        <Upload>
          <Button type="primary" icon={<UploadOutlined />}>Upload Document</Button>
        </Upload>
      </div>

      <Card>
        <Table columns={columns} dataSource={documents} loading={loading} rowKey="id" />
      </Card>
    </div>
  );
};
