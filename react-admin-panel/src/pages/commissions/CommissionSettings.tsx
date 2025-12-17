import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Input, Select, InputNumber, Form, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { getCommissionRules, updateCommissionRules, LevelCommissionRule } from '../../services/commissionSettingsService';

const { Option } = Select;

const CommissionSettings: React.FC = () => {
  const [rules, setRules] = useState<LevelCommissionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await getCommissionRules();
      // Ensure data is sorted by level
      const sortedData = data.sort((a, b) => a.level - b.level);
      setRules(sortedData);
      form.setFieldsValue({ rules: sortedData });
    } catch (error) {
      console.error('Failed to fetch commission rules:', error);
      message.error('Failed to load commission settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const updatedRules = values.rules.map((rule: LevelCommissionRule, index: number) => ({
        ...rule,
        level: index + 1 // Ensure levels are sequential
      }));
      await updateCommissionRules(updatedRules);
      message.success('Commission settings saved successfully');
      fetchRules(); // Refresh
    } catch (error) {
      console.error('Failed to save rules:', error);
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (_: any, __: any, index: number) => <span>Level {index + 1}</span>,
    },
    {
      title: 'Commission Type',
      dataIndex: 'commissionType',
      key: 'commissionType',
      render: (_: any, __: any, index: number) => (
        <Form.Item
          name={['rules', index, 'commissionType']}
          rules={[{ required: true, message: 'Required' }]}
          initialValue="PERCENTAGE"
          noStyle
        >
          <Select style={{ width: 120 }}>
            <Option value="PERCENTAGE">Percentage</Option>
            <Option value="FIXED">Fixed Amount</Option>
          </Select>
        </Form.Item>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (_: any, __: any, index: number) => (
        <Form.Item
          name={['rules', index, 'value']}
          rules={[{ required: true, message: 'Required' }]}
          noStyle
        >
          <InputNumber min={0} step={0.01} style={{ width: 150 }} />
        </Form.Item>
      ),
    },
    {
      title: 'Required Rank (Optional)',
      dataIndex: 'requiredRank',
      key: 'requiredRank',
      render: (_: any, __: any, index: number) => (
        <Form.Item
          name={['rules', index, 'requiredRank']}
          noStyle
        >
          <Input placeholder="e.g. Gold" />
        </Form.Item>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, field: any, index: number) => (
        <Popconfirm title="Remove this level?" onConfirm={() => removeLevel(index)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const addLevel = () => {
    const newRule: LevelCommissionRule = {
      level: rules.length + 1,
      commissionType: 'PERCENTAGE',
      value: 0,
      isActive: true
    };
    const newRules = [...rules, newRule];
    setRules(newRules);
    form.setFieldsValue({ rules: newRules });
  };

  const removeLevel = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    // Re-assign levels
    const reindexedRules = newRules.map((r, i) => ({ ...r, level: i + 1 }));
    setRules(reindexedRules);
    form.setFieldsValue({ rules: reindexedRules });
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Manual Level Commission Settings"
        extra={
          <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading}>
            Save Settings
          </Button>
        }
      >
        <Form form={form} onFinish={handleSave}>
          <Table
            dataSource={rules}
            columns={columns}
            rowKey="level"
            pagination={false}
            loading={loading}
            footer={() => (
              <Button type="dashed" onClick={addLevel} block icon={<PlusOutlined />}>
                Add Level
              </Button>
            )}
          />
        </Form>
      </Card>
    </div>
  );
};

export default CommissionSettings;
