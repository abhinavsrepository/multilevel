import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Typography,
  DatePicker,
  Modal,
  Select,
  message
} from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  DollarOutlined,
  HomeOutlined,
  BarChartOutlined,
  FileProtectOutlined,
  DownloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportCard {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  icon: React.ReactNode;
  categoryColor: string;
}

const ReportsDashboard: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [generating, setGenerating] = useState(false);

  const reportCards: ReportCard[] = [
    {
      id: 'monthly-statement',
      title: 'Monthly Statement',
      description: 'Comprehensive monthly financial statement with all transactions',
      category: 'FINANCIAL',
      color: '#1890ff',
      icon: <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      categoryColor: '#1890ff'
    },
    {
      id: 'commission-report',
      title: 'Commission Report',
      description: 'Detailed commission earnings breakdown by type and period',
      category: 'FINANCIAL',
      color: '#52c41a',
      icon: <DollarOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      categoryColor: '#52c41a'
    },
    {
      id: 'investment-report',
      title: 'Investment Report',
      description: 'Portfolio summary with all investments and returns',
      category: 'INVESTMENT',
      color: '#fa8c16',
      icon: <HomeOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      categoryColor: '#fa8c16'
    },
    {
      id: 'team-report',
      title: 'Team Report',
      description: 'Complete team structure and performance metrics',
      category: 'TEAM',
      color: '#722ed1',
      icon: <TeamOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      categoryColor: '#722ed1'
    },
    {
      id: 'tax-report',
      title: 'Tax Report',
      description: 'Annual tax report with TDS details and Form 26AS',
      category: 'TAX',
      color: '#f5222d',
      icon: <FileProtectOutlined style={{ fontSize: 32, color: '#f5222d' }} />,
      categoryColor: '#f5222d'
    },
    {
      id: 'annual-report',
      title: 'Annual Report',
      description: 'Complete annual performance and financial summary',
      category: 'FINANCIAL',
      color: '#13c2c2',
      icon: <BarChartOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
      categoryColor: '#13c2c2'
    }
  ];

  const handleGenerateReport = (report: ReportCard) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  const handleDownloadReport = async () => {
    if (!selectedReport) return;

    setGenerating(true);
    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000));

      message.success(`${selectedReport.title} generated successfully!`);
      setIsModalVisible(false);

      // Here you would typically trigger actual download
      // const response = await reportApi.generate({
      //   reportType: selectedReport.id,
      //   startDate: dateRange[0].toISOString(),
      //   endDate: dateRange[1].toISOString(),
      //   format: reportFormat
      // });
      // downloadFile(response.data);

    } catch (error) {
      message.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>Reports</Title>
        <Paragraph style={{ color: '#8c8c8c', margin: '8px 0 0' }}>
          Generate and download various financial, investment, and team reports
        </Paragraph>
      </div>

      {/* Report Cards Grid */}
      <Row gutter={[24, 24]}>
        {reportCards.map((report) => (
          <Col xs={24} sm={12} lg={8} key={report.id}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                borderTop: `4px solid ${report.color}`,
                height: '100%'
              }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {/* Icon and Title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    backgroundColor: `${report.color}15`,
                    padding: 16,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {report.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                      {report.title}
                    </Title>
                    <Tag color={report.categoryColor} style={{ margin: 0 }}>
                      {report.category}
                    </Tag>
                  </div>
                </div>

                {/* Description */}
                <Paragraph style={{ color: '#8c8c8c', margin: 0, minHeight: 48 }}>
                  {report.description}
                </Paragraph>

                {/* Generate Button */}
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  block
                  size="large"
                  style={{
                    backgroundColor: report.color,
                    borderColor: report.color
                  }}
                  onClick={() => handleGenerateReport(report)}
                >
                  Generate Report
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Generate Report Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>Generate {selectedReport?.title}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="generate"
            type="primary"
            icon={<DownloadOutlined />}
            loading={generating}
            onClick={handleDownloadReport}
            style={{
              backgroundColor: selectedReport?.color,
              borderColor: selectedReport?.color
            }}
          >
            Download Report
          </Button>
        ]}
        width={600}
      >
        <Space direction="vertical" size={24} style={{ width: '100%', marginTop: 24 }}>
          {/* Date Range Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Date Range
            </label>
            <RangePicker
              style={{ width: '100%' }}
              size="large"
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
              format="DD MMM YYYY"
            />
          </div>

          {/* Format Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Report Format
            </label>
            <Select
              value={reportFormat}
              onChange={setReportFormat}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="pdf">PDF Document</Option>
              <Option value="excel">Excel Spreadsheet (.xlsx)</Option>
              <Option value="csv">CSV File</Option>
            </Select>
          </div>

          {/* Report Preview Info */}
          <Card style={{ backgroundColor: '#f5f5f5' }}>
            <Space direction="vertical" size={8}>
              <div>
                <strong>Report Type:</strong> {selectedReport?.title}
              </div>
              <div>
                <strong>Category:</strong>{' '}
                <Tag color={selectedReport?.categoryColor}>
                  {selectedReport?.category}
                </Tag>
              </div>
              <div>
                <strong>Period:</strong> {dateRange[0].format('DD MMM YYYY')} - {dateRange[1].format('DD MMM YYYY')}
              </div>
              <div>
                <strong>Format:</strong> {reportFormat.toUpperCase()}
              </div>
            </Space>
          </Card>
        </Space>
      </Modal>
    </div>
  );
};

export default ReportsDashboard;
