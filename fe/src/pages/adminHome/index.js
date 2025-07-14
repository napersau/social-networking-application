import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Spin,
  message,
  Avatar,
  Tag,
  Switch,
} from "antd";
import { getAllUsers, toggleActiveUser } from "../../services/userService";
import "./styles.css";

const { Title } = Typography;

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data.result || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await toggleActiveUser(userId);
      message.success("Cập nhật trạng thái thành công");
      fetchUsers(); // cập nhật lại bảng
    } catch (error) {
      console.error("Toggle error:", error);
      message.error("Không thể cập nhật trạng thái người dùng");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Avatar",
      dataIndex: "avatarUrl",
      key: "avatarUrl",
      render: (url) =>
        url ? <Avatar src={url} /> : <Avatar style={{ backgroundColor: "#87d068" }}>U</Avatar>,
    },
    { title: "Tên người dùng", dataIndex: "username", key: "username" },
    {
      title: "Họ tên",
      key: "fullName",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT", dataIndex: "phone", key: "phone" },
    { title: "Giới tính", dataIndex: "gender", key: "gender" },
    {
      title: "Ngày sinh",
      dataIndex: "birthDate",
      key: "birthDate",
      render: (date) => date ? new Date(date).toLocaleDateString() : "",
    },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active) =>
        active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Bị khóa</Tag>,
    },
    {
      title: "Xác minh",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (verified) =>
        verified ? <Tag color="blue">Đã xác minh</Tag> : <Tag color="default">Chưa xác minh</Tag>,
    },
    {
      title: "Lần đăng nhập cuối",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => date ? new Date(date).toLocaleString() : "Chưa đăng nhập",
    },
    {
      title: "Vai trò",
      dataIndex: ["role", "name"],
      key: "role",
      render: (roleName) => <Tag color="geekblue">{roleName}</Tag>,
    },
    {
      title: "Khóa tài khoản",
      key: "action",
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          checkedChildren="Mở"
          unCheckedChildren="Khóa"
          onChange={() => handleToggleActive(record.id)}
          style={{
            backgroundColor: record.isActive ? "#52c41a" : "#f5222d",
          }}
        />
      ),
    },
  ];

  return (
    <div className="admin-home-container">
      <Title level={2}>Danh sách người dùng</Title>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1300 }}
          className="admin-user-table"
        />
      )}
    </div>
  );
};

export default AdminHome;
