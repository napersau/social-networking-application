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
  FileTextOutlined,
} from "@ant-design/icons";

import { getUserById } from "../../services/userService";
import {
  createFriendship,
  createFriendshipResponse,
  getFriendshipStatus,
} from "../../services/friendshipService";

import "./styles.css";

const { Title, Text } = Typography;

function InforUser() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState("NONE");

  const navigate = useNavigate();
  const { userId } = useParams();
  const myId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError("Thiếu ID người dùng");
      setLoading(false);
      return;
    }
    fetchUserInfo();
    fetchFriendshipStatus();
  }, [userId]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await getUserById(userId);
      if (response?.data?.result) {
        setUserInfo(response.data.result);
      } else {
        setError("Không tìm thấy người dùng");
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin người dùng:", err);
      setError("Không thể tải thông tin người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendshipStatus = async () => {
    try {
      const res = await getFriendshipStatus(userId);
      const data = res?.data?.result;

      if (!data) {
        setFriendshipStatus("NONE");
      } else if (data.status === "ACCEPTED") {
        setFriendshipStatus("FRIENDS");
      } else if (data.status === "PENDING") {
        if (data.user.id === parseInt(userId)) {
          setFriendshipStatus("PENDING_RECEIVED");
        } else {
          setFriendshipStatus("PENDING_SENT");
        }
      }
    } catch (err) {
      console.error("Lỗi khi lấy trạng thái kết bạn:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleViewPosts = () => {
    navigate(`/posts/${userId}`);
  };

  const handleAddFriend = async () => {
    try {
      const res = await createFriendship({
        friendId: parseInt(userId),
        status: "PENDING",
      });

      if (res?.data?.code === 1000) {
        notification.success({
          message: "Đã gửi lời mời kết bạn",
        });
        setFriendshipStatus("PENDING_SENT");
      } else {
        notification.error({
          message: "Lỗi gửi lời mời",
          description: res?.data?.message || "Vui lòng thử lại.",
        });
      }
    } catch (err) {
      console.error("Lỗi khi gửi lời mời:", err);
      notification.error({
        message: "Lỗi hệ thống",
        description: "Không thể gửi lời mời.",
      });
    }
  };

  const handleAcceptFriend = async () => {
    try {
      const res = await createFriendshipResponse(myId, parseInt(userId), "ACCEPTED");
      if (res?.data?.code === 1000) {
        notification.success({
          message: "Đã chấp nhận lời mời kết bạn",
        });
        setFriendshipStatus("FRIENDS");
      }
    } catch (err) {
      console.error("Lỗi chấp nhận:", err);
      notification.error({
        message: "Không thể chấp nhận lời mời",
      });
    }
  };

  const handleRejectFriend = async () => {
    try {
      const res = await createFriendshipResponse(myId, parseInt(userId), "REJECTED");
      if (res?.data?.code === 1000) {
        notification.info({
          message: "Đã từ chối hoặc hủy kết bạn",
        });
        setFriendshipStatus("NONE");
      }
    } catch (err) {
      console.error("Lỗi khi từ chối/hủy:", err);
      notification.error({
        message: "Không thể thực hiện hành động",
      });
    }
  };

  if (loading) {
    return (
      <div className="info-user-container">
        <div className="loading-wrapper">
          <Spin size="large" />
          <Text>Đang tải thông tin người dùng...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="info-user-container">
        <Card>
          <Alert message="Lỗi" description={error} type="error" showIcon />
          <div style={{ marginTop: 16 }}>
            <Button onClick={handleGoBack} icon={<ArrowLeftOutlined />}>
              Quay lại
            </Button>
            <Button
              type="primary"
              onClick={fetchUserInfo}
              style={{ marginLeft: 8 }}
            >
              Thử lại
            </Button>
          </div>
        </Card>
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
            size="large"
          >
            Quay lại
          </Button>
        </div>

        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={24} md={16} lg={14} xl={12}>
            <Card className="user-profile-card">
              {/* Header */}
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
                    />
                  </Badge>
                </div>
                <div className="user-info-header">
                  <Title level={2}>
                    {`${userInfo?.firstName || ""} ${userInfo?.lastName || ""}`}
                  </Title>
                  <Tag color={userInfo?.isActive ? "green" : "red"}>
                    {userInfo?.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </Tag>
                </div>
              </div>

              <Divider />

              {/* Info */}
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ID người dùng">
                  <Text code>{userInfo?.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {userInfo?.email || "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {userInfo?.phone || "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tham gia">
                  {formatDate(userInfo?.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật gần nhất">
                  {formatDate(userInfo?.updatedAt)}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* Actions */}
              <Space size="middle" wrap>
                <Button icon={<MessageOutlined />} type="primary" size="large">
                  Nhắn tin
                </Button>
                <Button
                  icon={<FileTextOutlined />}
                  size="large"
                  onClick={handleViewPosts}
                >
                  Bài viết
                </Button>

                {/* Dynamic button theo trạng thái bạn bè */}
                {friendshipStatus === "NONE" && (
                  <Button
                    icon={<UserAddOutlined />}
                    size="large"
                    onClick={handleAddFriend}
                  >
                    Kết bạn
                  </Button>
                )}

                {friendshipStatus === "PENDING_SENT" && (
                  <Button danger size="large" onClick={handleRejectFriend}>
                    Hủy lời mời
                  </Button>
                )}

                {friendshipStatus === "PENDING_RECEIVED" && (
                  <>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleAcceptFriend}
                    >
                      Chấp nhận
                    </Button>
                    <Button danger size="large" onClick={handleRejectFriend}>
                      Từ chối
                    </Button>
                  </>
                )}

                {friendshipStatus === "FRIENDS" && (
                  <Space size="middle">
                    <Tag color="blue">Bạn bè</Tag>
                    <Button danger size="large" onClick={handleRejectFriend}>
                      Hủy kết bạn
                    </Button>
                  </Space>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default InforUser;
