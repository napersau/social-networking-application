import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Eye, EyeOff, Facebook, Github, Mail } from "lucide-react"
import "./styles.css"

const Login = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const authRequest = {
        username: formData.username,
        password: formData.password,
        loginMethod: "LoginNormal",
      }

      const response = await axios.post("http://localhost:8080/api/v1/auth/token", authRequest, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Nếu backend có dùng cookies/session
      })

      const data = response.data

      if (data.code === 1000) {
        localStorage.setItem("token", data.result.token)
        if (data.result.refreshToken) {
          localStorage.setItem("refreshToken", data.result.refreshToken)
        }
        navigate("/")
      } else {
        setError(data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
      }
    } catch (err) {
      console.error("Login error:", err)
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider) => {
    console.log(`Đăng nhập bằng ${provider}`)
    // Implement social login logic here
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="card-header">
            <div className="logo-container">
              <div className="logo">
                <Mail size={32} />
              </div>
            </div>
            <h1 className="card-title">Chào mừng trở lại</h1>
            <p className="card-description">Đăng nhập vào tài khoản của bạn để tiếp tục</p>
          </div>

          <div className="card-content">
            {error && (
              <div className="alert alert-error">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Tên đăng nhập hoặc Email</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập hoặc email"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="form-input password-input"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                </div>
                <a href="/forgot-password" className="forgot-password">
                  Quên mật khẩu?
                </a>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className="divider">
              <span>Hoặc đăng nhập bằng</span>
            </div>

            <div className="social-buttons">
              <button className="social-button facebook" onClick={() => handleSocialLogin("Facebook")}>
                <Facebook size={16} />
                Facebook
              </button>
              <button className="social-button github" onClick={() => handleSocialLogin("GitHub")}>
                <Github size={16} />
                GitHub
              </button>
            </div>

            <div className="signup-link">
              Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
