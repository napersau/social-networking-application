import { useState, useEffect } from "react"
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  message,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Spin,
  Typography,
  Divider,
} from "antd"
import {
  UserOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CameraOutlined,
  PictureOutlined,
} from "@ant-design/icons"
import axios from "axios"
import dayjs from "dayjs"
import "./styles.css"

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

function UpdateProfile() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [coverUrl, setCoverUrl] = useState("")

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:8080/api/v1/users/my-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const userData = response.data.result
      setUserInfo(userData)
      setAvatarUrl(userData.avatarUrl || "")
      setCoverUrl(userData.coverUrl || "")

      // Set form values
      form.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        bio: userData.bio,
        address: userData.address,
        gender: userData.gender,
        birthDate: userData.birthDate ? dayjs(userData.birthDate) : null,
      })
    } catch (error) {
      console.error("Error fetching user info:", error)
      message.error("Không thể tải thông tin người dùng")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      
      // Prepare data for submission
      const updateData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format("YYYY-MM-DD") : null,
        avatarUrl: avatarUrl,
        coverUrl: coverUrl,
      }

      const response = await axios.put(
        "http://localhost:8080/api/v1/users/profile",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (response.data.code === 1000) {
        message.success("Cập nhật thông tin thành công!")
        setTimeout(() => {
          window.history.back()
          
        }, 1500)
      } else {
        message.error(response.data.message || "Cập nhật thông tin thất bại!")
      }
    } catch (error) {
      console.error("Update profile error:", error)
      message.error("Có lỗi xảy ra khi cập nhật thông tin")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "http://localhost:8080/api/v1/upload/avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.data.code === 1000) {
        setAvatarUrl(response.data.result.url)
        message.success("Tải ảnh đại diện thành công!")
      } else {
        message.error("Tải ảnh thất bại!")
      }
    } catch (error) {
      console.error("Avatar upload error:", error)
      message.error("Có lỗi xảy ra khi tải ảnh")
    }

    return false // Prevent default upload behavior
  }

  const handleCoverUpload = async (file) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "http://localhost:8080/api/v1/upload/cover",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.data.code === 1000) {
        setCoverUrl(response.data.result.url)
        message.success("Tải ảnh bìa thành công!")
      } else {
        message.error("Tải ảnh thất bại!")
      }
    } catch (error) {
      console.error("Cover upload error:", error)
      message.error("Có lỗi xảy ra khi tải ảnh")
    }

    return false // Prevent default upload behavior
  }

  const handleBack = () => {
    // Navigate back to profile page
    window.history.back()
    // Or use your router: navigate('/profile')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="update-profile-container">
      {/* Header */}
      <div className="update-profile-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          className="back-button"
        >
          Quay lại
        </Button>
        <Title level={2}>Cập nhật thông tin cá nhân</Title>
      </div>

      {/* Cover Image Section */}
      <div className="cover-upload-section">
        <div className="cover-image-container">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="cover-preview" />
          ) : (
            <div className="cover-placeholder">
              <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            </div>
          )}
          <Upload
            beforeUpload={handleCoverUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button 
              className="cover-upload-button" 
              icon={<CameraOutlined />}
            >
              Thay đổi ảnh bìa
            </Button>
          </Upload>
        </div>
      </div>

      {/* Main Content */}
      <div className="update-profile-content">
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={20} lg={16} xl={12}>
            <Card>
              {/* Avatar Section */}
              <div className="avatar-upload-section">
                <Avatar
                  size={120}
                  src={avatarUrl}
                  icon={<UserOutlined />}
                  className="profile-avatar-large"
                />
                <Upload
                  beforeUpload={handleAvatarUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button 
                    type="dashed" 
                    icon={<CameraOutlined />}
                    className="avatar-upload-button"
                  >
                    Thay đổi ảnh đại diện
                  </Button>
                </Upload>
              </div>

              <Divider />

              {/* Form */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Họ"
                      name="firstName"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ!" },
                        { max: 50, message: "Họ không được quá 50 ký tự!" }
                      ]}
                    >
                      <Input placeholder="Nhập họ của bạn" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Tên"
                      name="lastName"
                      rules={[
                        { required: true, message: "Vui lòng nhập tên!" },
                        { max: 50, message: "Tên không được quá 50 ký tự!" }
                      ]}
                    >
                      <Input placeholder="Nhập tên của bạn" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { type: "email", message: "Email không hợp lệ!" },
                        { max: 100, message: "Email không được quá 100 ký tự!" }
                      ]}
                    >
                      <Input placeholder="Nhập email của bạn" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" }
                      ]}
                    >
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Giới tính"
                      name="gender"
                    >
                      <Select placeholder="Chọn giới tính">
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Ngày sinh"
                      name="birthDate"
                    >
                      <DatePicker 
                        placeholder="Chọn ngày sinh"
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[
                    { max: 200, message: "Địa chỉ không được quá 200 ký tự!" }
                  ]}
                >
                  <Input placeholder="Nhập địa chỉ của bạn" />
                </Form.Item>

                <Form.Item
                  label="Giới thiệu bản thân"
                  name="bio"
                  rules={[
                    { max: 500, message: "Giới thiệu không được quá 500 ký tự!" }
                  ]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <Form.Item>
                  <Space size="middle">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={saving}
                      size="large"
                    >
                      Lưu thay đổi
                    </Button>
                    <Button 
                      size="large"
                      onClick={handleBack}
                    >
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default UpdateProfile