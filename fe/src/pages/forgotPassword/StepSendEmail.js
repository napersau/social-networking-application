import { Form, Input, Button, message } from "antd";
import { sendForgotPasswordOtp } from "../../services/emailService";

const StepSendEmail = ({ setEmail, onNext  }) => {
  const onFinish = async (values) => {
    try {
      await sendForgotPasswordOtp({ email: values.email });
      setEmail(values.email);
      message.success("OTP đã được gửi đến email");
      onNext();
    } catch (err) {
      console.log(err)
      message.error(err.response?.data?.message || "Gửi OTP thất bại");
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: "Vui lòng nhập email!" }]}
      >
        <Input placeholder="Nhập email đã đăng ký" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Gửi OTP
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StepSendEmail;
