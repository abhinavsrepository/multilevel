import React, { useEffect, useState } from 'react';
import { Card, Progress, Statistic, Row, Col, List, Typography, Spin, Alert } from 'antd';
import { rankApi } from '../../api/rankApi';
import { TrophyOutlined, TeamOutlined, DollarOutlined, RocketOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Props {
    userId: number;
}

const RankProgressWidget: React.FC<Props> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchProgress();
    }, [userId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const res = await rankApi.getRankProgress(userId);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spin />;
    if (!data) return <Alert message="No rank progress data found" type="info" />;

    const { progress, overallProgress, guidance, currentRank, nextRank } = data;

    return (
        <Card
            title={
                <div className="flex items-center gap-2">
                    <TrophyOutlined style={{ color: '#faad14' }} />
                    <span>Rank Progress & Goals</span>
                </div>
            }
            className="shadow-md rounded-lg"
        >
            <Row gutter={[24, 24]}>
                <Col xs={24} md={8} className="text-center border-r border-gray-100">
                    <div className="mb-4">
                        <Text type="secondary">Current Rank</Text>
                        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{currentRank.name}</Title>
                    </div>
                    <Progress
                        type="circle"
                        percent={overallProgress}
                        width={120}
                        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                    />
                    <div className="mt-4">
                        <Text type="secondary">Next Target</Text>
                        <Title level={4} style={{ margin: 0, color: '#722ed1' }}>{nextRank ? nextRank.name : 'Max Rank'}</Title>
                    </div>
                </Col>

                <Col xs={24} md={16}>
                    <Title level={5}>Detailed Requirements</Title>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-1">
                                <Text><TeamOutlined /> Direct Referrals</Text>
                                <Text strong>{progress.directReferrals.current} / {progress.directReferrals.required}</Text>
                            </div>
                            <Progress percent={progress.directReferrals.percentage} status="active" />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <Text><RocketOutlined /> Team Business</Text>
                                <Text strong>${progress.teamInvestment.current} / ${progress.teamInvestment.required}</Text>
                            </div>
                            <Progress percent={progress.teamInvestment.percentage} strokeColor="#722ed1" status="active" />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <Text><DollarOutlined /> Personal Investment</Text>
                                <Text strong>${progress.personalInvestment.current} / ${progress.personalInvestment.required}</Text>
                            </div>
                            <Progress percent={progress.personalInvestment.percentage} strokeColor="#52c41a" status="active" />
                        </div>
                    </div>

                    {Array.isArray(guidance) && guidance.length > 0 && (
                        <div className="mt-6 bg-blue-50 p-4 rounded-md">
                            <Title level={5} style={{ fontSize: '14px' }}>Recommended Actions to Upgrade</Title>
                            <List
                                size="small"
                                dataSource={guidance}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <Text type="secondary">• {item}</Text>
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                </Col>
            </Row>
        </Card>
    );
};

export default RankProgressWidget;
