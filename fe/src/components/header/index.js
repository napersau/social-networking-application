import { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Drawer,
  Space,
  Avatar,
  Dropdown,
  Typography,
  Badge,
  List,
  Spin,
  message,
} from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
  MessageOutlined,
  LogoutOutlined,
  InfoCircleOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles.css";
import {
  getNotifications,
  updateNotification,
  deleteNotification,
} from "../../services/notificationService";
import { io } from "socket.io-client";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

function Header() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState({ role: "USER" });
  const [activeKey, setActiveKey] = useState("home");
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await getNotifications();
      setNotifications(res.data.result || []);
      setHasNewNotification(false);
    } catch (error) {
      message.error("Không thể tải thông báo");
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.scope?.name || "USER";
        const userId = payload.sub;
        setUser({ role });

        const socket = io("http://localhost:9092", {
          transports: ["websocket"],
          query: {
            token: token, // Hoặc rút gọn thành chỉ "token" nếu ES6
          },
        });

        socket.emit("join", userId);

        socket.on("notification", (newNotification) => {
          setNotifications((prev) => [newNotification, ...prev]);
          setHasNewNotification(true);
        });

        loadNotifications();

        return () => socket.disconnect();
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/home" || path === "/") setActiveKey("home");
    else if (path === "/posts") setActiveKey("posts");
    else if (path === "/friends") setActiveKey("friends");
    else if (path === "/chat") setActiveKey("messages");
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNotificationClick = async (id, actionUrl) => {
    try {
      await updateNotification(id);
      loadNotifications();
      if (actionUrl) navigate(actionUrl);
    } catch (error) {
      message.error("Không thể cập nhật trạng thái thông báo");
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      message.success("Đã xoá thông báo");
      loadNotifications();
    } catch (error) {
      message.error("Xoá thông báo thất bại");
    }
  };

  const handleMenuClick = ({ key }) => {
    setActiveKey(key);
    if (key === "logout") handleLogout();
    else if (key === "admin" && user.role === "ADMIN") navigate("/admin");
    else if (key === "profile") navigate("/profile");
    else if (key === "messages") navigate("/chat");
    else if (key === "home") navigate("/home");
    else if (key === "friends") navigate("/friends");
    else if (key === "posts") navigate("/posts");
    setDrawerVisible(false);
  };

  const userMenuItems = [
    ...(user.role === "ADMIN"
      ? [
          {
            key: "admin",
            icon: <InfoCircleOutlined />,
            label: "Trang quản trị",
          },
        ]
      : []),
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
    },
  ];

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Trang chủ",
    },
    {
      key: "posts",
      icon: <InfoCircleOutlined />,
      label: "Bài viết",
    },
    {
      key: "friends",
      icon: <TeamOutlined />,
      label: "Bạn bè",
    },
    {
      key: "messages",
      icon: <MessageOutlined />,
      label: "Tin nhắn",
    },
  ];

  return (
    <AntHeader className="custom-header">
      <div className="header-content">
        <div className="logo">
          <img
            src="https://res.cloudinary.com/dif55ggpc/image/upload/v1751630179/pngtree-sleeping-capybara-clipart-icon-hand-drawn-png-image_16394362_ilfxxz.avif"
            alt="SocialNet Logo"
            className="logo-icon"
            style={{ width: "50px", height: "50px", marginRight: "8px" }}
          />
        </div>

        <div className="desktop-menu">
          <Menu
            mode="horizontal"
            items={menuItems}
            className="main-menu"
            selectedKeys={[activeKey]}
            onClick={handleMenuClick}
          />
        </div>

        <div className="header-actions">
          <Space size="large">
            <Dropdown
              trigger={["click"]}
              popupRender={() => (
                <div className="notification-dropdown">
                  <Spin spinning={loadingNotifications}>
                    <List
                      dataSource={notifications}
                      locale={{ emptyText: "Không có thông báo" }}
                      renderItem={(item) => (
                        <List.Item
                          className={
                            item.isRead
                              ? "notification-item read"
                              : "notification-item unread"
                          }
                          onClick={() =>
                            handleNotificationClick(item.id, item.actionUrl)
                          }
                          actions={[
                            <Dropdown
                              trigger={["click"]}
                              menu={{
                                items: [
                                  {
                                    key: "delete",
                                    label: "Xoá",
                                    onClick: () =>
                                      handleDeleteNotification(item.id),
                                  },
                                ],
                              }}
                            >
                              <EllipsisOutlined />
                            </Dropdown>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                style={{ backgroundColor: "#87d068" }}
                                src={item.sender.avatarUrl}
                                icon={<UserOutlined />}
                              />
                            }
                            title={
                              <>
                                <span style={{ fontWeight: 500 }}>
                                  {item.sender.firstName && item.sender.lastName
                                    ? `${item.sender.firstName} ${item.sender.lastName}`
                                    : item.sender.username}
                                </span>
                                <div>{item.title}</div>
                              </>
                            }
                            description={item.content}
                          />
                          <div style={{ fontSize: "12px", color: "#999" }}>
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </div>
                        </List.Item>
                      )}
                    />
                  </Spin>
                </div>
              )}
            >
              <Badge
                count={notifications.filter((n) => !n.isRead).length}
                size="small"
              >
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className={`action-button notification-button ${
                    hasNewNotification ? "shake" : ""
                  }`}
                  size="large"
                  onClick={loadNotifications}
                />
              </Badge>
            </Dropdown>

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="user-dropdown"
            >
              <div className="avatar-container">
                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  className="avatar-icon"
                />
                <div className="user-info">
                  <Text className="user-role">{user.role}</Text>
                </div>
              </div>
            </Dropdown>

            <Button
              type="text"
              icon={<MenuOutlined />}
              className="mobile-menu-button"
              onClick={() => setDrawerVisible(true)}
              size="large"
            />
          </Space>
        </div>
      </div>

      <Drawer
        title={
          <div className="drawer-header">
            <div className="logo">
              <img
                src="https://res.cloudinary.com/dif55ggpc/image/upload/v1751630179/pngtree-sleeping-capybara-clipart-icon-hand-drawn-png-image_16394362_ilfxxz.avif"
                alt="SocialNet Logo"
                className="logo-icon"
                style={{ width: "32px", height: "32px", marginRight: "8px" }}
              />
              <Text className="logo-text">SocialNet</Text>
            </div>
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={300}
        className="mobile-drawer"
      >
        <Menu
          mode="vertical"
          items={menuItems}
          className="mobile-menu"
          selectedKeys={[activeKey]}
          onClick={handleMenuClick}
        />

        <div className="drawer-footer">
          <div className="avatar-container mobile-avatar">
            <Avatar
              size="large"
              icon={<UserOutlined />}
              className="avatar-icon"
            />
            <div className="user-info">
              <Text className="user-role">{user.role}</Text>
            </div>
          </div>

          <div className="user-actions">
            {user.role === "ADMIN" && (
              <Button
                type="text"
                icon={<InfoCircleOutlined />}
                onClick={() => handleMenuClick({ key: "admin" })}
                block
              >
                Trang quản trị
              </Button>
            )}
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => handleMenuClick({ key: "profile" })}
              block
            >
              Thông tin cá nhân
            </Button>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => handleMenuClick({ key: "logout" })}
              block
              danger
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </Drawer>
    </AntHeader>
  );
}

export default Header;
