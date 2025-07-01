import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  MenuOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
  MessageOutlined,
  SearchOutlined,
  LogoutOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

function Header() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState({ role: "USER" }); // Mặc định là USER
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Giải mã payload
        const role = payload.scope?.name || "USER";
        setUser({ role });
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    } else if (key === "admin" && user.role === "ADMIN") {
      navigate("/admin");
    } else if (key === "profile") {
      navigate("/profile");
    } else if (key === "messages") {
      navigate("/chat"); // Điều hướng đến trang chat
    } else if (key === "home") {
      navigate("/home");
    } else if (key === "friends") {
      navigate("/friends");
    } else if (key === "notifications") {
      navigate("/notifications");
    }
    setDrawerVisible(false); // Đóng Drawer sau khi chọn
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
      key: "friends",
      icon: <TeamOutlined />,
      label: "Bạn bè",
    },
    {
      key: "messages",
      icon: <MessageOutlined />,
      label: "Tin nhắn",
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "Thông báo",
    },
  ];

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <AntHeader className="custom-header">
      <div className="header-content">
        {/* Logo */}
        <div className="logo">
          <Text className="logo-text">SocialNet</Text>
        </div>

        {/* Menu desktop */}
        <div className="desktop-menu">
          <Menu
            mode="horizontal"
            items={menuItems}
            className="main-menu"
            selectedKeys={["home"]}
            onClick={handleMenuClick}
          />
        </div>

        {/* Actions */}
        <div className="header-actions">
          <Space size="middle">
            <Button
              type="text"
              icon={<SearchOutlined />}
              className="action-button"
            />
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="action-button"
              />
            </Badge>

            {/* Avatar Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Avatar
                size="large"
                icon={<UserOutlined />}
                className="avatar-icon"
                style={{ cursor: "pointer", backgroundColor: "#1677ff" }}
              />
            </Dropdown>

            {/* Mobile menu toggle */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="mobile-menu-button"
              onClick={showDrawer}
            />
          </Space>
        </div>
      </div>

      {/* Drawer mobile */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={280}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          className="mobile-menu"
          selectedKeys={["home"]}
          onClick={handleMenuClick}
        />
        <div style={{ marginTop: 16 }}>
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleMenuClick }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Avatar
              size="large"
              icon={<UserOutlined />}
              className="avatar-icon"
              style={{ cursor: "pointer", backgroundColor: "#1677ff" }}
            />
          </Dropdown>
        </div>
      </Drawer>
    </AntHeader>
  );
}

export default Header;