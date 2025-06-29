import { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Image,
  Divider,
  Modal,
  Form,
  Input,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./styles.css";
import { useNavigate } from "react-router-dom";


const { Title, Text, Paragraph } = Typography;

function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/api/v1/users/my-info",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserInfo(response.data.result);
    } catch (error) {
      console.error("Error fetching user info:", error);
      message.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:8080/api/v1/users/password",
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code === 1000) {
        message.success("Đổi mật khẩu thành công!");
        setIsModalOpen(false);
        form.resetFields();
      } else {
        message.error(response.data.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      console.error("Password change error:", error);
      message.error("Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getRoleColor = (roleName) => {
    switch (roleName?.toUpperCase()) {
      case "ADMIN":
        return "red";
      case "MODERATOR":
        return "orange";
      case "USER":
        return "blue";
      default:
        return "#1677ff";
    }
  };

  const getGenderText = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="error-container">
        <Text type="danger">Không thể tải thông tin người dùng</Text>
      </div>
    );
  }

  return (
    <div className="my-info-container">
      <div className="cover-section">
        {userInfo.coverUrl ? (
          <Image
            src={userInfo.coverUrl || "/placeholder.svg"}
            alt="Cover"
            className="cover-image"
            preview={false}
          />
        ) : (
          <div className="cover-placeholder" />
        )}

        <div className="profile-header">
          <div className="avatar-section">
            <Avatar
              size={120}
              src={userInfo.avatarUrl}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
            <div className="profile-basic-info">
              <Title level={2} className="profile-name">
                {userInfo.firstName} {userInfo.lastName}
              </Title>
              <Text className="profile-username">@{userInfo.username}</Text>
              <div className="profile-tags">
                <Tag
                  color={getRoleColor(userInfo.role?.name)}
                  icon={<CrownOutlined />}
                >
                  {userInfo.role?.name || "USER"}
                </Tag>
                <Tag
                  color={userInfo.isActive ? "green" : "red"}
                  icon={
                    userInfo.isActive ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )
                  }
                >
                  {userInfo.isActive ? "Hoạt động" : "Không hoạt động"}
                </Tag>
                {userInfo.isVerified && (
                  <Tag color="#1677ff" icon={<CheckCircleOutlined />}>
                    Đã xác thực
                  </Tag>
                )}
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate("/update-profile")} // or your routing method
              >
                Chỉnh sửa hồ sơ
              </Button>
              <Button type="default" onClick={() => setIsModalOpen(true)}>
                Đổi mật khẩu
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Giới thiệu" className="info-card">
              {userInfo.bio ? (
                <Paragraph className="bio-text">{userInfo.bio}</Paragraph>
              ) : (
                <Text type="secondary">Chưa có thông tin giới thiệu</Text>
              )}
            </Card>

            <Card title="Thông tin cá nhân" className="info-card">
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                <Descriptions.Item
                  label={
                    <>
                      <CalendarOutlined /> Ngày sinh
                    </>
                  }
                >
                  {formatDate(userInfo.birthDate)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined /> Giới tính
                    </>
                  }
                >
                  {getGenderText(userInfo.gender)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <PhoneOutlined /> Số điện thoại
                    </>
                  }
                >
                  {userInfo.phone || "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <MailOutlined /> Email
                    </>
                  }
                >
                  {userInfo.email || "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <HomeOutlined /> Địa chỉ
                    </>
                  }
                  span={2}
                >
                  {userInfo.address || "Chưa cập nhật"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Thông tin tài khoản" className="info-card">
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div className="account-item">
                  <Text strong>Tên đăng nhập:</Text>
                  <br />
                  <Text>{userInfo.username}</Text>
                </div>

                <Divider />

                <div className="account-item">
                  <Text strong>Vai trò:</Text>
                  <br />
                  <Tag color={getRoleColor(userInfo.role?.name)}>
                    {userInfo.role?.name || "USER"}
                  </Tag>
                  {userInfo.role?.description && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {userInfo.role.description}
                      </Text>
                    </div>
                  )}
                </div>

                <Divider />

                <div className="account-item">
                  <Text strong>Trạng thái tài khoản:</Text>
                  <br />
                  <Space>
                    <Tag
                      color={userInfo.isActive ? "green" : "red"}
                      icon={
                        userInfo.isActive ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )
                      }
                    >
                      {userInfo.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                    {userInfo.isVerified && (
                      <Tag color="#1677ff" icon={<CheckCircleOutlined />}>
                        Đã xác thực
                      </Tag>
                    )}
                  </Space>
                </div>

                <Divider />

                <div className="account-item">
                  <Text strong>Lần đăng nhập cuối:</Text>
                  <br />
                  <Text type="secondary">
                    {formatDateTime(userInfo.lastLogin)}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title="Đổi mật khẩu"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordChange}
          autoComplete="off"
        >
          <Form.Item
            label="Mật khẩu cũ"
            name="oldPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Profile;
