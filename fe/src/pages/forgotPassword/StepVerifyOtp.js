import { Form, Input, Button, message } from "antd";
import { verifyOtp } from "../../services/emailService";

const StepVerifyOtp = ({ email, setOtp, onNext, onBack  }) => {
  const onFinish = async (values) => {
    try {
      await verifyOtp({ email, otp: values.otp });
      setOtp(values.otp);
      message.success("Xác minh OTP thành công");
      onNext();
    } catch (err) {
        console.log(err)
      message.error(err.response?.data?.message || "OTP không hợp lệ");
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Mã OTP"
        name="otp"
        rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
      >
        <Input placeholder="Nhập mã OTP từ email" />
      </Form.Item>
      <Form.Item>
        <Button onClick={onBack } style={{ marginRight: 8 }}>
          Quay lại
        </Button>
        <Button type="primary" htmlType="submit">
          Xác minh
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StepVerifyOtp;
