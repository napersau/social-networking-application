import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../../services/localStorageService';
import { jwtDecode } from 'jwt-decode';

const PrivateRoutes = ({ children }) => {
    const location = useLocation();
    const token = getToken();

    // Kiểm tra có token không
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Kiểm tra token có hợp lệ không
    try {
        const decoded = jwtDecode(token);
        
        // Kiểm tra token có hết hạn không
        if (decoded.exp * 1000 < Date.now()) {
            // Token hết hạn, xóa token và redirect đến login
            localStorage.removeItem('token');
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
        
        // Token hợp lệ, render children
        return children;
    } catch (error) {
        // Token không hợp lệ
        console.error('Token không hợp lệ:', error);
        localStorage.removeItem('token');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
};

export default PrivateRoutes;