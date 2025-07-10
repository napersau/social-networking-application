import Home from "../pages/home";
import Login from "../pages/login";
import Layout from "../layout";
import PrivateRoutes from "../components/PrivateRoutes";
import Register from "../pages/register";
import Profile from "../pages/profile";
import UpdateProfile from "../pages/updateProfile";
import Chat from "../pages/chat";
import Post from "../pages/post";
import InforUser from "../pages/inforUser";

const Routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      // Các route công khai
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },

      // Các route yêu cầu đăng nhập
      {
        element: <PrivateRoutes />,
        children: [
          { path: "", element: <Home /> },
          { path: "home", element: <Home /> },
          { path: "profile", element: <Profile /> },
          { path: "profile/:userId", element: <InforUser /> },
          { path: "update-profile", element: <UpdateProfile /> },
          { path: "posts", element: <Post /> },
          { path: "chat", element: <Chat /> },
        ],
      },
    ],
  },
];

export default Routes;