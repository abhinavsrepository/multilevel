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
    Avatar,
    Tag,
    Tooltip,
    Spin,
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    DownloadOutlined,
    UserOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { teamApi, TreeNode, TeamStats } from '@/api/team.api';
import './TreeView.scss';

const TreeView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState<TreeNode | null>(null);
    const [stats, setStats] = useState<TeamStats | null>(null);
    const [searchUserId, setSearchUserId] = useState<string>('');

    useEffect(() => {
        fetchTreeData();
        fetchStats();
    }, []);

    const fetchTreeData = async (userId?: number) => {
        try {
            setLoading(true);
            const response = await teamApi.getTreeView(userId);
            if (response.data.success) {
                setTreeData(response.data.data);
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

    const handleSearch = () => {
        const userId = parseInt(searchUserId);
        if (userId && !isNaN(userId)) {
            fetchTreeData(userId);
        } else {
            fetchTreeData();
        }
    };

    const renderTreeNode = (node: TreeNode | null | undefined, position?: 'left' | 'right'): React.ReactNode => {
        if (!node) {
            return (
                <div className={`tree-node empty ${position || ''}`}>
                    <div className="node-card empty-slot">
                        <div className="empty-indicator">
                            <UserOutlined style={{ fontSize: 24, color: '#ccc' }} />
                            <div>Empty Slot</div>
                        </div>
                    </div>
                </div>
            );
        }

        const statusColor = node.status === 'ACTIVE' ? 'green' : node.status === 'INACTIVE' ? 'orange' : 'red';

        return (
            <div className={`tree-node ${position || ''}`}>
                <Tooltip title={`Level ${node.level} - ${node.rank}`}>
                    <div className="node-card" onClick={() => fetchTreeData(node.userId)}>
                        <Avatar
                            src={node.profilePicture}
                            size={50}
                            icon={<UserOutlined />}
                            style={{ marginBottom: 8 }}
                        />
                        <div className="node-name">
                            {node.firstName} {node.lastName}
                        </div>
                        <div className="node-username">@{node.username}</div>
                        <Tag color={statusColor} style={{ marginTop: 4 }}>
                            {node.status}
                        </Tag>
                        <div className="node-stats">
                            <div><strong>Level:</strong> {node.level}</div>
                            <div><strong>BV:</strong> {node.personalBv}</div>
                            <div><strong>Team:</strong> {node.totalDownline}</div>
                        </div>
                        <div className="node-legs">
                            <div className="leg-stat">
                                <span>L: {node.leftBv}</span>
                            </div>
                            <div className="leg-stat">
                                <span>R: {node.rightBv}</span>
                            </div>
                        </div>
                    </div>
                </Tooltip>
            </div>
        );
    };

    const renderBinaryTree = (node: TreeNode | null): React.ReactNode => {
        if (!node) return null;

        return (
            <div className="tree-container">
                <div className="tree-level">
                    {renderTreeNode(node)}
                </div>
                {(node.leftChild || node.rightChild) && (
                    <div className="tree-branches">
                        <div className="branch-line"></div>
                        <div className="tree-children">
                            <div className="child-wrapper left">
                                {renderTreeNode(node.leftChild, 'left')}
                                {node.leftChild && (node.leftChild.leftChild || node.leftChild.rightChild) && (
                                    <div className="sub-tree">
                                        {renderBinaryTree(node.leftChild)}
                                    </div>
                                )}
                            </div>
                            <div className="child-wrapper right">
                                {renderTreeNode(node.rightChild, 'right')}
                                {node.rightChild && (node.rightChild.leftChild || node.rightChild.rightChild) && (
                                    <div className="sub-tree">
                                        {renderBinaryTree(node.rightChild)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="tree-view-page" style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>
                        <TeamOutlined /> Binary Tree View
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
                        Visual representation of team binary structure
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
                                title="Total Members"
                                value={stats.totalMembers}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Active Members"
                                value={stats.activeMembers}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Left BV"
                                value={stats.leftBv}
                                precision={0}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Right BV"
                                value={stats.rightBv}
                                precision={0}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Search */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                        <Input
                            placeholder="Enter User ID to view their tree..."
                            prefix={<SearchOutlined />}
                            value={searchUserId}
                            onChange={(e) => setSearchUserId(e.target.value)}
                            onPressEnter={handleSearch}
                            size="large"
                        />
                    </Col>
                    <Col>
                        <Button type="primary" size="large" onClick={handleSearch}>
                            Search
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Tree Visualization */}
            <Card>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16 }}>Loading tree structure...</div>
                    </div>
                ) : treeData ? (
                    <div className="binary-tree-wrapper">
                        {renderBinaryTree(treeData)}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        No tree data available
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TreeView;
