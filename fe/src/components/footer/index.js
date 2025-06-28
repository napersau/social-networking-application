import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { 
  FacebookOutlined, 
  TwitterOutlined, 
  InstagramOutlined, 
  LinkedinOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import './styles.css';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

function Footer() {
  return (
    <AntFooter className="custom-footer">
      <div className="footer-content">
        <Row gutter={[32, 32]}>
          {/* Company Info */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={4} className="footer-title">
                Công ty ABC
              </Title>
              <Text className="footer-description">
                Chúng tôi cung cấp các giải pháp công nghệ hàng đầu để giúp doanh nghiệp phát triển bền vững.
              </Text>
              <div className="social-links">
                <Space size="middle">
                  <Link href="#" className="social-link">
                    <FacebookOutlined />
                  </Link>
                  <Link href="#" className="social-link">
                    <TwitterOutlined />
                  </Link>
                  <Link href="#" className="social-link">
                    <InstagramOutlined />
                  </Link>
                  <Link href="#" className="social-link">
                    <LinkedinOutlined />
                  </Link>
                </Space>
              </div>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={5} className="footer-subtitle">
                Liên kết nhanh
              </Title>
              <ul className="footer-links">
                <li><Link href="#" className="footer-link">Trang chủ</Link></li>
                <li><Link href="#" className="footer-link">Về chúng tôi</Link></li>
                <li><Link href="#" className="footer-link">Dịch vụ</Link></li>
                <li><Link href="#" className="footer-link">Sản phẩm</Link></li>
                <li><Link href="#" className="footer-link">Tin tức</Link></li>
              </ul>
            </div>
          </Col>

          {/* Services */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={5} className="footer-subtitle">
                Dịch vụ
              </Title>
              <ul className="footer-links">
                <li><Link href="#" className="footer-link">Phát triển web</Link></li>
                <li><Link href="#" className="footer-link">Ứng dụng di động</Link></li>
                <li><Link href="#" className="footer-link">Tư vấn IT</Link></li>
                <li><Link href="#" className="footer-link">Bảo trì hệ thống</Link></li>
                <li><Link href="#" className="footer-link">Đào tạo</Link></li>
              </ul>
            </div>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} md={6}>
            <div className="footer-section">
              <Title level={5} className="footer-subtitle">
                Liên hệ
              </Title>
              <div className="contact-info">
                <div className="contact-item">
                  <EnvironmentOutlined className="contact-icon" />
                  <Text className="contact-text">
                    123 Đường ABC, Quận 1, TP.HCM
                  </Text>
                </div>
                <div className="contact-item">
                  <PhoneOutlined className="contact-icon" />
                  <Text className="contact-text">
                    +84 123 456 789
                  </Text>
                </div>
                <div className="contact-item">
                  <MailOutlined className="contact-icon" />
                  <Text className="contact-text">
                    info@company.com
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Divider className="footer-divider" />

        <Row justify="space-between" align="middle" className="footer-bottom">
          <Col xs={24} md={12}>
            <Text className="copyright-text">
              © 2024 Công ty ABC. Tất cả quyền được bảo lưu.
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <div className="footer-bottom-links">
              <Space split={<Divider type="vertical" />}>
                <Link href="#" className="footer-bottom-link">Chính sách bảo mật</Link>
                <Link href="#" className="footer-bottom-link">Điều khoản sử dụng</Link>
                <Link href="#" className="footer-bottom-link">Sitemap</Link>
              </Space>
            </div>
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
}

export default Footer;