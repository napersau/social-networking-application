import { Outlet, useLocation } from "react-router-dom";
import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Content } from "antd/es/layout/layout";
import { useState } from "react";
import { getToken } from "../services/localStorageService";
import { jwtDecode } from "jwt-decode";
import Header from '../components/header';
import Footer from '../components/footer';
// import MenuSider from '../components/MenuSider'; // Uncomment khi bạn có component này

function AppLayout(){
    const location = useLocation();
    const token = getToken();
    const [collapsed, setCollapsed] = useState(true);
    let userRole = null;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userRole = decoded.scope?.name || null;
        } catch (error) {
            console.error("Lỗi giải mã token:", error);
        }
    }

    const isAdminPage = location.pathname.startsWith("/admin");
    const isLoginPage = location.pathname === "/login";

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Chỉ hiển thị Sider khi user là ADMIN và đang ở trang admin */}
            {userRole === "ADMIN" && isAdminPage && (
                <Sider collapsed={collapsed} theme="light" className="sider" width={250}>
                    <div className="header__collapse" style={{marginTop:30}} onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </div>
                    {/* <MenuSider /> */}
                </Sider>
            )}
            <Layout>
                {/* Chỉ hiển thị Header khi không phải trang login */}
                {!isLoginPage && <Header />}
                
                <Content style={{ 
                    margin: isLoginPage ? "0" : "0", // Bỏ margin để Header/Footer căn chỉnh full width
                    padding: isLoginPage ? "0" : "20px",
                    background: isLoginPage ? "#fff" : "#f5f5f5",
                    flex: 1 // Đảm bảo content chiếm không gian còn lại
                }}>
                    <div>
                        <Outlet />
                    </div>
                </Content>
                
                {/* Chỉ hiển thị Footer khi không phải trang login */}
                {!isLoginPage && <Footer />}
            </Layout>
        </Layout>
    );
}

export default AppLayout;