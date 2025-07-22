import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

// Gửi OTP để reset mật khẩu
export const sendForgotPasswordOtp = async (emailData) => {
  return await httpClient.post(API.FORGOT_PASSWORD, emailData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Xác minh OTP
export const verifyOtp = async (otpData) => {
  return await httpClient.post(API.VERIFY_OTP, otpData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Đặt lại mật khẩu
export const resetPassword = async (resetData) => {
  return await httpClient.post(API.RESET_PASSWORD, resetData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
