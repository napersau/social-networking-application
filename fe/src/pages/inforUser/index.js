import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Spin,
  Alert,
  Descriptions,
  Tag,
  Space,
  Divider,
  notification,
  message,
  Badge,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  MessageOutlined,
  UserAddOutlined,
  EditOutlined,
  FileTextOutlined, // Thêm icon này
} from "@ant-design/icons";
import { getUserById } from "../../services/userService";
import "./styles.css";
import { createFriendship } from "../../services/friendshipService";

const { Title, Text } = Typography;

function InforUser() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
      setLoading(false);
      return;
    }
    fetchUserInfo();
  }, [userId]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserById(userId);
      if (response?.data?.result) {
        setUserInfo(response.data.result);
      } else {
        setError("Không tìm thấy người dùng");
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin người dùng:", err);
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewPosts = () => {
    navigate(`/posts/${userId}`);
  };

  const handleAddFriend = async () => {
    try {
      const friendshipRequest = {
        friendId: parseInt(userId),
        status: "PENDING",
      };

      const res = await createFriendship(friendshipRequest);

      if (res?.data?.code === 1000) {
        notification.success({
          message: "Gửi yêu cầu thành công",
          description: "Yêu cầu kết bạn đã được gửi đến người dùng.",
          placement: "topRight",
        });
      } else {
        notification.error({
          message: "Thất bại",
          description: res?.data?.message || "Gửi yêu cầu kết bạn thất bại.",
          placement: "topRight",
        });
      }
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu kết bạn:", err);
      notification.error({
        message: "Lỗi hệ thống",
        description: "Có lỗi xảy ra khi gửi yêu cầu kết bạn.",
        placement: "topRight",
      });
    }
  };

  if (loading) {
    return (
      <div className="info-user-container">
        <div className="loading-wrapper">
          <div className="loading-content">
            <Spin size="large" />
            <Text className="loading-text">
              Đang tải thông tin người dùng...
            </Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="info-user-container">
        <div className="error-wrapper">
          <Card className="error-card">
            <div className="error-content">
              <Alert
                message="Oops! Có lỗi xảy ra"
                description={error}
                type="error"
                showIcon
                className="error-alert"
              />
              <div className="error-actions">
                <Button
                  onClick={handleGoBack}
                  icon={<ArrowLeftOutlined />}
                  className="error-button"
                >
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  onClick={fetchUserInfo}
                  className="error-button"
                >
                  Thử lại
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="info-user-container">
      <div className="container-wrapper">
        <div className="back-button-wrapper">
          <Button
            onClick={handleGoBack}
            icon={<ArrowLeftOutlined />}
            className="back-button"
            size="large"
          >
            Quay lại
          </Button>
        </div>

        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={24} md={16} lg={14} xl={12}>
            <Card className="user-profile-card">
              {/* Header Section */}
              <div className="user-header-section">
                <div className="avatar-wrapper">
                  <Badge
                    dot
                    status={userInfo?.isActive ? "success" : "error"}
                    className="avatar-badge"
                  >
                    <Avatar
                      src={userInfo?.avatarUrl}
                      icon={<UserOutlined />}
                      size={140}
                      className="user-avatar"
                    />
                  </Badge>
                </div>

                <div className="user-info-header">
                  <Title level={1} className="user-display-name">
                    {`${userInfo?.firstName || ""} ${
                      userInfo?.lastName || ""
                    }`.trim() || "Người dùng"}
                  </Title>
                  <div className="user-status-wrapper">
                    <Tag
                      color={userInfo?.isActive ? "success" : "error"}
                      className="status-tag"
                    >
                      {userInfo?.isActive
                        ? "🟢 Đang hoạt động"
                        : "🔴 Không hoạt động"}
                    </Tag>
                  </div>
                </div>
              </div>

              <Divider className="section-divider" />

              {/* Details Section */}
              <div className="details-section">
                <Title level={3} className="section-title">
                  Thông tin chi tiết
                </Title>

                <Descriptions
                  bordered
                  column={1}
                  className="user-descriptions"
                  styles={{
                    label: {
                      fontWeight: 600,
                    },
                  }}
                >
                  <Descriptions.Item
                    label={
                      <Space className="description-label">
                        <IdcardOutlined />
                        ID người dùng
                      </Space>
                    }
                  >
                    <Text code className="user-id">
                      {userInfo?.id}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space className="description-label">
                        <MailOutlined />
                        Địa chỉ email
                      </Space>
                    }
                  >
                    <Text className="contact-info">
                      {userInfo?.email || "Chưa cập nhật"}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space className="description-label">
                        <PhoneOutlined />
                        Số điện thoại
                      </Space>
                    }
                  >
                    <Text className="contact-info">
                      {userInfo?.phone || "Chưa cập nhật"}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space className="description-label">
                        <CalendarOutlined />
                        Ngày tham gia
                      </Space>
                    }
                  >
                    <Text>{formatDate(userInfo?.createdAt)}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space className="description-label">
                        <CalendarOutlined />
                        Cập nhật gần nhất
                      </Space>
                    }
                  >
                    <Text>{formatDate(userInfo?.updatedAt)}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <Divider className="section-divider" />

              {/* Actions Section */}
              <div className="actions-section">
                <Title level={4} className="actions-title">
                  Hành động
                </Title>
                <Space size="middle" wrap className="action-buttons">
                  <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    size="large"
                    className="primary-action-btn"
                  >
                    Gửi tin nhắn
                  </Button>
                  <Button
                    icon={<FileTextOutlined />}
                    size="large"
                    className="posts-action-btn"
                    onClick={handleViewPosts}
                  >
                    Bài viết
                  </Button>
                  <Button
                    icon={<UserAddOutlined />}
                    size="large"
                    className="secondary-action-btn"
                    onClick={handleAddFriend}
                  >
                    Thêm bạn bè
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default InforUser;
