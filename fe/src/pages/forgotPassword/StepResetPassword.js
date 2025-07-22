import { Form, Input, Button, message } from "antd";
import { resetPassword } from "../../services/emailService";
import { useNavigate } from "react-router-dom";

const StepResetPassword = ({ email, otp, onBack  }) => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await resetPassword({ email, otp, newPassword: values.password });
      message.success("Đặt lại mật khẩu thành công");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.log(err)
      message.error(err.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Mật khẩu mới"
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
      >
        <Input.Password placeholder="Nhập mật khẩu mới" />
      </Form.Item>
      <Form.Item>
        <Button onClick={onBack } style={{ marginRight: 8 }}>
          Quay lại
        </Button>
        <Button type="primary" htmlType="submit">
          Đặt lại
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StepResetPassword;
