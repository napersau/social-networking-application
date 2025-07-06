import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken } from '../../services/localStorageService';
import { jwtDecode } from 'jwt-decode';

const PrivateRoutes = () => {
    const location = useLocation();
    const token = getToken();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        // ✅ Dùng Outlet thay vì children
        return <Outlet />;
    } catch (error) {
        console.error('Token không hợp lệ:', error);
        localStorage.removeItem('token');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
};

export default PrivateRoutes;
