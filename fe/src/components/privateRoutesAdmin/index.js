import { jwtDecode } from "jwt-decode";
import { getToken } from "../../services/localStorageService";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoutesAdmin() {
  const token = getToken();

  if (!token) {
    // Không có token => quay lại trang login
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.scope?.name;

    if (userRole === "ADMIN") {
      return <Outlet />;
    } else {
      return <Navigate to="/home" replace />;
    }
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    return <Navigate to="/login" replace />;
  }
}
