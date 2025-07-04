"use client"

import { useState, useEffect } from "react"
import { Layout, Menu, Button, Drawer, Space, Avatar, Dropdown, Typography, Badge } from "antd"
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
} from "@ant-design/icons"
import { useNavigate, useLocation } from "react-router-dom"
import "./styles.css"

const { Header: AntHeader } = Layout
const { Text } = Typography

function Header() {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [user, setUser] = useState({ role: "USER" })
  const [activeKey, setActiveKey] = useState("home")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const role = payload.scope?.name || "USER"
        setUser({ role })
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error)
      }
    }
  }, [])

  // Cập nhật active key dựa trên route hiện tại
  useEffect(() => {
    const path = location.pathname
    if (path === "/home" || path === "/") {
      setActiveKey("home")
    } else if (path === "/friends") {
      setActiveKey("friends")
    } else if (path === "/chat") {
      setActiveKey("messages")
    } else if (path === "/notifications") {
      setActiveKey("notifications")
    }
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const handleMenuClick = ({ key }) => {
    setActiveKey(key)

    if (key === "logout") {
      handleLogout()
    } else if (key === "admin" && user.role === "ADMIN") {
      navigate("/admin")
    } else if (key === "profile") {
      navigate("/profile")
    } else if (key === "messages") {
      navigate("/chat")
    } else if (key === "home") {
      navigate("/home")
    } else if (key === "friends") {
      navigate("/friends")
    } else if (key === "notifications") {
      navigate("/notifications")
    }
    setDrawerVisible(false)
  }

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
  ]

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
  ]

  const showDrawer = () => {
    setDrawerVisible(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  return (
    <AntHeader className="custom-header">
      <div className="header-content">
        {/* Logo */}
        <div className="logo">
          <img
            src="https://res.cloudinary.com/dif55ggpc/image/upload/v1751630179/pngtree-sleeping-capybara-clipart-icon-hand-drawn-png-image_16394362_ilfxxz.avif"
            alt="SocialNet Logo"
            className="logo-icon"
            style={{ width: "50px", height: "50px", marginRight: "8px" }}
          />
       
        </div>

        {/* Menu desktop */}
        <div className="desktop-menu">
          <Menu
            mode="horizontal"
            items={menuItems}
            className="main-menu"
            selectedKeys={[activeKey]}
            onClick={handleMenuClick}
          />
        </div>

        {/* Actions */}
        <div className="header-actions">
          <Space size="large">
            <Button type="text" icon={<SearchOutlined />} className="action-button search-button" size="large" />
            <Badge count={3} size="small" className="notification-badge">
              <Button type="text" icon={<BellOutlined />} className="action-button notification-button" size="large" />
            </Badge>

            {/* Avatar Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="user-dropdown"
            >
              <div className="avatar-container">
                <Avatar size="large" icon={<UserOutlined />} className="avatar-icon" />
                <div className="user-info">
                  <Text className="user-role">{user.role}</Text>
                </div>
              </div>
            </Dropdown>

            {/* Mobile menu toggle */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="mobile-menu-button"
              onClick={showDrawer}
              size="large"
            />
          </Space>
        </div>
      </div>

      {/* Drawer mobile */}
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
        onClose={closeDrawer}
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
            <Avatar size="large" icon={<UserOutlined />} className="avatar-icon" />
            <div className="user-info">
              <Text className="user-role">{user.role}</Text>
            </div>
          </div>

          <div className="user-actions">
            {user.role === "ADMIN" && (
              <Button type="text" icon={<InfoCircleOutlined />} onClick={() => handleMenuClick({ key: "admin" })} block>
                Trang quản trị
              </Button>
            )}
            <Button type="text" icon={<UserOutlined />} onClick={() => handleMenuClick({ key: "profile" })} block>
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
  )
}

export default Header