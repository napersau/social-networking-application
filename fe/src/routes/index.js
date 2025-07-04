import Home from "../pages/home"
import Login from "../pages/login"
import Layout from "../layout"
import PrivateRoutes from "../components/PrivateRoutes"
import Register from "../pages/register"
import Profile from "../pages/profile"
import UpdateProfile from "../pages/updateProfile"
import Chat from "../pages/chat"
// import PrivateRoutesAdmin from "../components/PrivateRoutesAdmin"

const Routes = [
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '',
                element: <PrivateRoutes><Home /></PrivateRoutes>
            },
            {
                path: 'home',
                element: <PrivateRoutes><Home /></PrivateRoutes>
            },
            {
                path: 'profile',
                element: <PrivateRoutes><Profile /></PrivateRoutes>
            },
            {
                path: 'update-profile',
                element: <PrivateRoutes><UpdateProfile /></PrivateRoutes>
            },
            {
                path: 'chat',
                element: <PrivateRoutes><Chat /></PrivateRoutes>
            },
            {
                path: 'login',
                element: <Login />
            },
            {
                path: 'register',
                element: <Register />
            },
            {
                element: <PrivateRoutes />,
                children: [
                    // Các route cần đăng nhập
                ]
            }
        ]
    }
];

export default Routes;
