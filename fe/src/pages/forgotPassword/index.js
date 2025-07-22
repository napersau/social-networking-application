import React, { useState } from "react";
import { Steps } from "antd";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  SmileOutlined,
} from "@ant-design/icons";

import EmailStep from "./StepSendEmail";
import OtpStep from "./StepVerifyOtp";
import ResetPasswordStep from "./StepResetPassword";
import "./styles.css";

const ForgotPassword = () => {
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const next = () => setCurrent(current + 1);
  const prev = () => setCurrent(current - 1);

  const steps = [
    {
      title: "Email",
      icon: <UserOutlined />,
      content: (
        <EmailStep
          onNext={next}
          setEmail={setEmail}
        />
      ),
    },
    {
      title: "Verify OTP",
      icon: <SafetyCertificateOutlined />,
      content: (
        <OtpStep
          email={email}
          onNext={next}
          setOtp={setOtp} 
          onBack={prev}
        />
      ),
    },
    {
      title: "Reset Password",
      icon: <LockOutlined />,
      content: (
        <ResetPasswordStep
          email={email}
           otp={otp}
          onBack={prev}
        />
      ),
    },
  ];

  return (
    <div className="forgot-password-container">
      <h2 className="title">Forgot Password</h2>
      <Steps current={current} items={steps} className="steps-bar" />
      <div className="step-content">{steps[current].content}</div>
    </div>
  );
};

export default ForgotPassword;
