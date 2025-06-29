
import { Form, Input, Button, message, Typography, Card, Row, Col, Space, Divider } from "antd"
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserAddOutlined,
  CloseOutlined,
} from "@ant-design/icons"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./styles.css"

const { Title, Text } = Typography

const Register = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      const response = await axios.post("http://localhost:8080/api/v1/users", values)
      if (response.data?.code === 1000) {
        message.success("Đăng ký thành công!", 3)
        setTimeout(() => {
          navigate("/login")
        }, 1500)
      } else {
        message.error("Đăng ký thất bại. Vui lòng thử lại!")
      }
    } catch (error) {
      message.error("Lỗi khi gọi API. Vui lòng kiểm tra dữ liệu!")
    }
  }

  const handleCancel = () => {
    navigate("/login") // hoặc navigate("/") để về trang chủ
  }

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <Card className="register-card" bordered={false}>
          <div className="register-header">
            <UserAddOutlined className="register-icon" />
            <Title level={2} className="register-title">
              Đăng ký tài khoản
            </Title>
            <Text type="secondary" className="register-subtitle">
              Tạo tài khoản mới để bắt đầu sử dụng dịch vụ
            </Text>
          </div>

          <Divider />

          <Form
            form={form}
            name="registerForm"
            onFinish={onFinish}
            layout="vertical"
            className="register-form"
            size="large"
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="firstName" label="Họ" rules={[{ required: true, message: "Vui lòng nhập họ" }]}>
                  <Input prefix={<UserOutlined />} placeholder="Nhập họ của bạn" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="lastName" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                  <Input prefix={<UserOutlined />} placeholder="Nhập tên của bạn" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập địa chỉ email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"))
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Form.Item className="register-buttons">
              <Space size="middle" className="button-group">
                <Button type="default" icon={<CloseOutlined />} onClick={handleCancel} className="cancel-button">
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" icon={<UserAddOutlined />} className="submit-button">
                  Đăng ký
                </Button>
              </Space>
            </Form.Item>
          </Form>

          <div className="register-footer">
            <Text type="secondary">
              Đã có tài khoản?{" "}
              <Button type="link" onClick={() => navigate("/login")}>
                Đăng nhập ngay
              </Button>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Register
