import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Descriptions,
    Tag,
    Spin,
    Button,
    Statistic,
    Avatar,
    Divider,
    message
} from 'antd';
import {
    UserOutlined,
    ArrowLeftOutlined,
    DollarOutlined,
    TeamOutlined,
    TrophyOutlined,
    PhoneOutlined,
    MailOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { api } from '@/api/axiosConfig';
import dayjs from 'dayjs';

interface TeamMemberDetails {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    rank: string;
    status: string;
    createdAt: string;
    profilePhotoUrl: string | null;
    sponsorId: number | null;
    placementUserId: number | null;
    personalBv: number;
    teamBv: number;
    leftBv: number;
    rightBv: number;
    carryForwardLeft: number;
    carryForwardRight: number;
    totalInvestment: number;
    directReferralsCount: number;
    teamSize: number;
    Sponsor?: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
    };
    PlacementUser?: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
    };
}

const TeamDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [member, setMember] = useState<TeamMemberDetails | null>(null);

    useEffect(() => {
        if (id) {
            fetchMemberDetails(id);
        }
    }, [id]);

    const fetchMemberDetails = async (memberId: string) => {
        try {
            setLoading(true);
            const response = await api.get(`/team/member/${memberId}`);
            if (response.data.success) {
                setMember(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to fetch member details');
            navigate('/team/tree-view'); // Redirect back on error
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!member) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'green';
            case 'INACTIVE': return 'red';
            case 'SUSPENDED': return 'orange';
            default: return 'default';
        }
    };

    return (
        <div className="team-detail" style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Back
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                {/* Profile Card */}
                <Col xs={24} md={8}>
                    <Card>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar
                                size={100}
                                src={member.profilePhotoUrl}
                                icon={<UserOutlined />}
                                style={{ marginBottom: 16 }}
                            />
                            <h2 style={{ margin: 0 }}>{member.firstName} {member.lastName}</h2>
                            <p style={{ color: '#8c8c8c' }}>@{member.username}</p>
                            <Tag color={getStatusColor(member.status)}>{member.status}</Tag>
                            <div style={{ marginTop: 8 }}>
                                <Tag icon={<TrophyOutlined />} color="gold">{member.rank}</Tag>
                            </div>
                        </div>

                        <Divider />

                        <Descriptions column={1} size="small">
                            <Descriptions.Item label={<><MailOutlined /> Email</>}>
                                {member.email}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                                {member.phoneNumber || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><CalendarOutlined /> Joined</>}>
                                {dayjs(member.createdAt).format('DD MMM YYYY')}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card style={{ marginTop: 24 }} title="Upline Information">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Sponsor">
                                {member.Sponsor ? (
                                    <a onClick={() => navigate(`/team/detail/${member.Sponsor?.id}`)}>
                                        {member.Sponsor.firstName} {member.Sponsor.lastName} (@{member.Sponsor.username})
                                    </a>
                                ) : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Placement">
                                {member.PlacementUser ? (
                                    <a onClick={() => navigate(`/team/detail/${member.PlacementUser?.id}`)}>
                                        {member.PlacementUser.firstName} {member.PlacementUser.lastName} (@{member.PlacementUser.username})
                                    </a>
                                ) : '-'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Stats & Details */}
                <Col xs={24} md={16}>
                    <Row gutter={[16, 16]}>
                        <Col xs={12} sm={8}>
                            <Card>
                                <Statistic
                                    title="Total Investment"
                                    value={member.totalInvestment}
                                    prefix={<DollarOutlined />}
                                    precision={2}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={8}>
                            <Card>
                                <Statistic
                                    title="Team Size"
                                    value={member.teamSize}
                                    prefix={<TeamOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={8}>
                            <Card>
                                <Statistic
                                    title="Direct Referrals"
                                    value={member.directReferralsCount}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Business Volume (BV)" style={{ marginTop: 24 }}>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={12}>
                                <Descriptions title="Personal & Team" column={1} bordered>
                                    <Descriptions.Item label="Personal BV">{member.personalBv}</Descriptions.Item>
                                    <Descriptions.Item label="Team BV">{member.teamBv}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Descriptions title="Binary Legs" column={1} bordered>
                                    <Descriptions.Item label="Left BV">{member.leftBv}</Descriptions.Item>
                                    <Descriptions.Item label="Right BV">{member.rightBv}</Descriptions.Item>
                                    <Descriptions.Item label="Carry Forward Left">{member.carryForwardLeft}</Descriptions.Item>
                                    <Descriptions.Item label="Carry Forward Right">{member.carryForwardRight}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TeamDetail;
