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
import "./styles.css";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

function Header() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState({ role: "USER" }); // Mặc định là USER

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Giải mã phần payload của JWT
        const role = payload.scope?.name || "USER"; // Lấy scope.name làm role
        setUser({ role });
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    } else if (key === "admin" && user.role === "ADMIN") {
      window.location.href = "/admin";
    }
  };

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      {user.role === "ADMIN" && (
        <Menu.Item key="admin" icon={<InfoCircleOutlined />}>
          Trang quản trị
        </Menu.Item>
      )}
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

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
            <Dropdown overlay={userMenu} placement="bottomRight">
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
          onClick={closeDrawer}
        />
        <div style={{ marginTop: 16 }}>
          <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
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
