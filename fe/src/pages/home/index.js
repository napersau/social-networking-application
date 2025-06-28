import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Space, Statistic } from 'antd';
import { UserOutlined, DashboardOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { getToken, removeToken } from '../../services/localStorageService';
import { jwtDecode } from 'jwt-decode';
import './styles.css';

const { Title, Text } = Typography;

function Home() {
    const token = getToken();
    
    // Kiểm tra authentication
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    let userInfo = null;
    try {
        userInfo = jwtDecode(token);
    } catch (error) {
        console.error("Token không hợp lệ:", error);
        removeToken();
        return <Navigate to="/login" replace />;
    }

    // Kiểm tra token có hết hạn không
    if (userInfo.exp * 1000 < Date.now()) {
        removeToken();
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        removeToken();
        window.location.href = '/login';
    };

    return (
        <div className="home-container">
            {/* Header Welcome Section */}
            <Card className="welcome-card" bordered={false}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space direction="vertical" size={4}>
                            <Title level={2} className="welcome-title">
                                Chào mừng bạn trở lại!
                            </Title>
                            <Text className="welcome-subtitle">
                                Xin chào {userInfo?.username || userInfo?.sub}, 
                                vai trò: {userInfo?.scope?.name || 'User'}
                            </Text>
                        </Space>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            danger 
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            size="large"
                        >
                            Đăng xuất
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Stats Section */}
            <Row gutter={[16, 16]} className="stats-section">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Tổng người dùng"
                            value={1128}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Hoạt động hôm nay"
                            value={93}
                            suffix="%"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Doanh thu"
                            value={112893}
                            prefix="₫"
                            precision={2}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Đơn hàng"
                            value={93}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Card title="Hành động nhanh" className="quick-actions-card">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card 
                            hoverable 
                            className="action-card"
                            cover={<DashboardOutlined className="action-icon" />}
                        >
                            <Card.Meta
                                title="Dashboard"
                                description="Xem tổng quan hệ thống"
                            />
                            <Button type="primary" block style={{ marginTop: 16 }}>
                                Xem chi tiết
                            </Button>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card 
                            hoverable 
                            className="action-card"
                            cover={<UserOutlined className="action-icon" />}
                        >
                            <Card.Meta
                                title="Quản lý người dùng"
                                description="Thêm, sửa, xóa người dùng"
                            />
                            <Button type="primary" block style={{ marginTop: 16 }}>
                                Quản lý
                            </Button>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card 
                            hoverable 
                            className="action-card"
                            cover={<SettingOutlined className="action-icon" />}
                        >
                            <Card.Meta
                                title="Cài đặt"
                                description="Cấu hình hệ thống"
                            />
                            <Button type="primary" block style={{ marginTop: 16 }}>
                                Cài đặt
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Card>

            {/* Recent Activity */}
            <Card title="Hoạt động gần đây" className="recent-activity-card">
                <div className="activity-list">
                    <div className="activity-item">
                        <UserOutlined className="activity-icon" />
                        <div className="activity-content">
                            <Text strong>Người dùng mới đăng ký</Text>
                            <br />
                            <Text type="secondary">2 phút trước</Text>
                        </div>
                    </div>
                    <div className="activity-item">
                        <DashboardOutlined className="activity-icon" />
                        <div className="activity-content">
                            <Text strong>Báo cáo tháng được tạo</Text>
                            <br />
                            <Text type="secondary">1 giờ trước</Text>
                        </div>
                    </div>
                    <div className="activity-item">
                        <SettingOutlined className="activity-icon" />
                        <div className="activity-content">
                            <Text strong>Cập nhật cài đặt hệ thống</Text>
                            <br />
                            <Text type="secondary">3 giờ trước</Text>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default Home;