import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Space,
    Input,
    Row,
    Col,
    message,
    Statistic,
    Select,
    Tree,
    Avatar,
    Tag,
    Spin,
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    DownloadOutlined,
    UserOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { teamApi, TreeNode, TeamStats } from '@/api/team.api';

const { Option } = Select;

const TeamLevelTreeView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [stats, setStats] = useState<TeamStats | null>(null);
    const [searchUserId, setSearchUserId] = useState<string>('');
    const [maxLevel, setMaxLevel] = useState<number>(5);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

    useEffect(() => {
        fetchTreeData();
        fetchStats();
    }, [maxLevel]);

    const fetchTreeData = async (userId?: number) => {
        try {
            setLoading(true);
            const response = await teamApi.getLevelTreeView(userId, maxLevel);
            if (response.data.success) {
                const treeNodes = convertToAntdTree(response.data.data);
                setTreeData(treeNodes);
            }
        } catch (error) {
            message.error('Failed to fetch tree data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await teamApi.getTeamStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const convertToAntdTree = (node: TreeNode): DataNode[] => {
        if (!node) return [];

        const convert = (n: TreeNode): DataNode => {
            const title = (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar size="small" icon={<UserOutlined />} src={n.profilePicture} />
                    <span style={{ fontWeight: 500 }}>{n.firstName} {n.lastName}</span>
                    <Tag color="blue" size="small">L{n.level}</Tag>
                    <Tag color={n.status === 'ACTIVE' ? 'green' : 'orange'} size="small">
                        {n.status}
                    </Tag>
                    <span style={{ fontSize: 12, color: '#666' }}>
                        @{n.username} | BV: {n.personalBv} | Team: {n.totalDownline}
                    </span>
                </div>
            );

            return {
                key: n.userId.toString(),
                title,
                children: n.children ? n.children.map(convert) : [],
            };
        };

        return [convert(node)];
    };

    const handleSearch = () => {
        const userId = parseInt(searchUserId);
        if (userId && !isNaN(userId)) {
            fetchTreeData(userId);
        } else {
            fetchTreeData();
        }
    };

    const onExpand = (expandedKeysValue: React.Key[]) => {
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    return (
        <div className="team-level-tree-view" style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>
                        <TeamOutlined /> Team Level Tree View
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
                        Hierarchical view of team structure by levels
                    </p>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={() => handleSearch()}>
                            Refresh
                        </Button>
                        <Button type="primary" icon={<DownloadOutlined />}>
                            Export
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Stats Cards */}
            {stats && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Levels"
                                value={stats.totalLevels}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Members"
                                value={stats.totalMembers}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Direct Referrals"
                                value={stats.directReferrals}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Downline"
                                value={stats.totalDownline}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Controls */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col flex="200px">
                        <Select
                            value={maxLevel}
                            onChange={setMaxLevel}
                            style={{ width: '100%' }}
                        >
                            <Option value={3}>3 Levels</Option>
                            <Option value={5}>5 Levels</Option>
                            <Option value={10}>10 Levels</Option>
                            <Option value={999}>All Levels</Option>
                        </Select>
                    </Col>
                    <Col flex="auto">
                        <Input
                            placeholder="Enter User ID to view their tree..."
                            prefix={<SearchOutlined />}
                            value={searchUserId}
                            onChange={(e) => setSearchUserId(e.target.value)}
                            onPressEnter={handleSearch}
                        />
                    </Col>
                    <Col>
                        <Button type="primary" onClick={handleSearch}>
                            Search
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Tree View */}
            <Card>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16 }}>Loading tree structure...</div>
                    </div>
                ) : treeData.length > 0 ? (
                    <Tree
                        showLine
                        defaultExpandAll
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        onExpand={onExpand}
                        treeData={treeData}
                        style={{ padding: 20 }}
                    />
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        No tree data available
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TeamLevelTreeView;
