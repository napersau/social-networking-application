import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Facebook, Mail, User, Lock, CheckCircle, AlertCircle } from "lucide-react";
import "./styles.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const authRequest = {
        username: formData.username,
        password: formData.password,
        loginMethod: "LoginNormal",
      };

      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/token",
        authRequest,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = response.data;

      if (data.code === 1000) {
        localStorage.setItem("token", data.result.token);
        if (data.result.refreshToken) {
          localStorage.setItem("refreshToken", data.result.refreshToken);
        }
        navigate("/");
      } else {
        setError(
          data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginRedirect = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="ant-login-container">
      <div className="ant-login-wrapper">
        <div className="ant-login-card">
          <div className="ant-card-header">
            <div className="ant-logo-container">
              <div className="ant-logo">
                <Mail size={40} />
              </div>
            </div>
            <h1 className="ant-card-title">Chào mừng trở lại</h1>
            <p className="ant-card-description">
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </p>
          </div>

          <div className="ant-card-content">
            {error && (
              <div className="ant-alert ant-alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ant-login-form">
              <div className="ant-form-item">
                <label htmlFor="username" className="ant-form-label">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="ant-input-wrapper">
                  <User size={16} className="ant-input-prefix" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập hoặc email"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="ant-input"
                  />
                </div>
              </div>

              <div className="ant-form-item">
                <label htmlFor="password" className="ant-form-label">
                  Mật khẩu
                </label>
                <div className="ant-input-wrapper">
                  <Lock size={16} className="ant-input-prefix" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="ant-input"
                  />
                  <button
                    type="button"
                    className="ant-input-suffix"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="ant-form-options">
                <div className="ant-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="ant-checkbox"
                  />
                  <label htmlFor="remember" className="ant-checkbox-label">
                    <CheckCircle size={16} className="ant-checkbox-icon" />
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a href="/forgot-password" className="ant-link">
                  Quên mật khẩu?
                </a>
              </div>

              <button 
                type="submit" 
                className={`ant-btn ant-btn-primary ${loading ? 'ant-btn-loading' : ''}`}
                disabled={loading}
              >
                {loading && <div className="ant-loading-spinner"></div>}
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="ant-divider">
              <span className="ant-divider-text">Hoặc đăng nhập bằng</span>
            </div>

            <div className="ant-social-buttons">
              <button
                className="ant-btn ant-btn-default ant-social-btn"
                onClick={() => console.log("Đăng nhập Facebook")}
              >
                <Facebook size={16} />
                Facebook
              </button>

              <button
                className="ant-btn ant-btn-default ant-social-btn"
                onClick={handleGoogleLoginRedirect}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="google-icon">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            <div className="ant-signup-link">
              Chưa có tài khoản? <a href="/register" className="ant-link">Đăng ký ngay</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;