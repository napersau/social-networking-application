import Home from "../pages/home";
import Login from "../pages/login";
import Layout from "../layout";
import PrivateRoutes from "../components/PrivateRoutes";
import PrivateRoutesAdmin from "../components/privateRoutesAdmin"
import Register from "../pages/register";
import Profile from "../pages/profile";
import UpdateProfile from "../pages/updateProfile";
import Chat from "../pages/chat";
import Post from "../pages/post";
import InforUser from "../pages/inforUser";
import PostUser from "../pages/postUser";
import Friendship from "../pages/friendship";
import AdminHome from "../pages/adminHome";
import OAuth2RedirectHandler from "../pages/oAuth2RedirectHandler";
import ForgotPassword from "../pages/forgotPassword";

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
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "auth/signingoogle",
        element: <OAuth2RedirectHandler />,
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
          { path: "posts/:userId", element: <PostUser /> },
          { path: "chat", element: <Chat /> },
          { path: "friends", element: <Friendship /> },
        ],
      },

      // Admin-only routes
      {
        element: <PrivateRoutesAdmin />,
        children: [
          { path: "admin", element: <AdminHome /> },
        ],
      },
    ],
  },
];

export default Routes;