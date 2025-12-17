import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Space,
  Typography,
  Button,
  Select,
  message,
  Input,
  List,
  Avatar,
  Divider,
  Spin
} from 'antd';
import {
  UserOutlined,
  ArrowLeftOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { supportService } from '../../services/supportService';
import { Ticket } from '../../types/ticket.types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<any>(null); // Using any for now to accommodate backend structure
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await supportService.getTicketById(id);
      if (response.success) {
        setTicket(response.data);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch ticket details');
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleReply = async () => {
    if (!replyMessage.trim() || !id) return;

    try {
      setSubmitting(true);
      const response = await supportService.replyToTicket(id, replyMessage);
      if (response.success) {
        message.success('Reply sent successfully');
        setReplyMessage('');
        fetchTicket(); // Refresh to show new reply
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      const response = await supportService.updateTicketStatus(id, status);
      if (response.success) {
        message.success('Ticket status updated');
        fetchTicket();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'blue';
      case 'IN_PROGRESS': return 'orange';
      case 'RESOLVED': return 'green';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/support')}
        style={{ marginBottom: '16px' }}
      >
        Back to Tickets
      </Button>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Title level={4} style={{ margin: 0 }}>{ticket.subject}</Title>
                <Tag>{ticket.category}</Tag>
                <Tag color={getStatusColor(ticket.status)}>{ticket.status}</Tag>
              </Space>
              <Select
                value={ticket.status}
                style={{ width: 150 }}
                onChange={handleStatusChange}
              >
                <Option value="OPEN">Open</Option>
                <Option value="IN_PROGRESS">In Progress</Option>
                <Option value="RESOLVED">Resolved</Option>
                <Option value="CLOSED">Closed</Option>
              </Select>
            </div>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Ticket ID">{ticket.id}</Descriptions.Item>
            <Descriptions.Item label="Created At">{new Date(ticket.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="User">
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong>{ticket.user?.firstName} {ticket.user?.lastName}</Text>
                  <br />
                  <Text type="secondary">{ticket.user?.email}</Text>
                </div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              <Tag color={ticket.priority === 'URGENT' ? 'red' : 'blue'}>{ticket.priority}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Message" span={2}>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{ticket.message}</Paragraph>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Conversation">
          <List
            itemLayout="horizontal"
            dataSource={ticket.replies || []}
            renderItem={(item: any) => (
              <List.Item style={{
                backgroundColor: item.isAdminReply ? '#f0f5ff' : 'transparent',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #f0f0f0'
              }}>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: item.isAdminReply ? '#1890ff' : '#87d068' }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{item.isAdminReply ? 'Support Agent' : `${item.user?.firstName} ${item.user?.lastName}`}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <Text style={{ whiteSpace: 'pre-wrap' }}>{item.message}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />

          <Divider />

          <div style={{ marginTop: '24px' }}>
            <Title level={5}>Reply to Ticket</Title>
            <TextArea
              rows={4}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply here..."
              style={{ marginBottom: '16px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleReply}
              loading={submitting}
              disabled={!replyMessage.trim()}
            >
              Send Reply
            </Button>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default TicketDetail;
