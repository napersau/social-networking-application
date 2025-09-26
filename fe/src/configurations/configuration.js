export const OAuthConfig = {};

export const CONFIG = {
  API_GATEWAY: "http://localhost:8080/api/v1",
};

export const API = {
  LOGIN: "/identity/auth/token",
  MY_INFO: "/users/my-info",
  MY_POST: "/post/my-posts",
  CREATE_POST: "/post/create",
  UPDATE_PROFILE: "/profile/users/my-profile",
  UPDATE_AVATAR: "/profile/users/avatar",
  GET_USER: (userId) => `/users/${userId}`,
  SEARCH_USER: "/users/search",
  GET_ALL_USERS: "/users",
  TOGGLE_ACTIVE_USER: "/users/update",
  POST_SHARE: "/post-share",

  SEARCH_USER_BY_FULLNAME: "/users/search-user",
  MY_CONVERSATIONS: "/chat/conversations/my-conversations",
  CREATE_CONVERSATION: "/chat/conversations/create",
  CREATE_CONVERSATION_GROUP: "/chat/conversations/create-group",
  UPDATE_CONVERSATION: "/chat/conversations/update",
  DELETE_CONVERSATION: "/chat/conversations/delete",
  ADD_MEMBER_CONVERSATION: "/chat/conversations/add-user",
  REMOVE_MEMBER_CONVERSATION: "/chat/conversations/remove-user",


  CREATE_MESSAGE: "/chat/messages/create",
  MESSAGES: "/chat/messages",
  MARK_MESSAGES_AS_READ: "/chat/messages/read",
  REACT_TO_MESSAGE: "/chat/messages/react",


  CREATE_POST: "/posts",
  GET_POSTS: "/posts/user",
  GET_POSTS_BY_USERID: (userId) => `/posts/${userId}`,
  GET_POST_BY_ID: (postId) => `/posts/${postId}`,
  ID_POST: (postId) => `/posts/${postId}`,

  LIKE_POST: "/like", // POST - like a post
  LIKE_POST_SHARE: "/like/postShare", // POST - like a post share
  GET_POST_SHARE_LIKES: (postShareId) => `/like/list/${postShareId}`, // GET - get users who liked a post share
  GET_POST_LIKES_LIST: (postId) => `/like/list/post/${postId}`, 
  UNLIKE_POST: "/{postId}/like", // DELETE - unlike a post
  TOGGLE_LIKE: "/like", // POST - toggle like/unlike
  GET_POST_LIKES: "/{postId}/likes", // GET - get users who liked a post
  CHECK_LIKE_STATUS: "/{postId}/like-status", // GET - check if user liked a post
  GET_LIKE_COUNT: "/{postId}/like-count", // GET - get like count for a post
  GET_USER_LIKES: "/users/{userId}/likes", // GET - get posts liked by user
  GET_MY_LIKES: "/users/me/likes",
  TOGGLE_LIKE_COMMENT: "/like/comment",

  CREATE_COMMENT: "/comments/create",
  UPDATE_COMMENT: "/comments/update",
  DELETE_COMMENT: (id) => `/comments/${id}`,
  REPLY_COMMENT: "/comments/reply",
  REPLY_COMMENT_POSTSHARE: "/comments/reply/postShare",
  GET_COMMENTS_BY_POST_ID: "/comments/post/:postId", // 🔹 Revert về endpoint cũ
  // 🔹 Tạm thời comment out post share endpoint cho đến khi backend ready
  // GET_COMMENTS_BY_POST_SHARE_ID: (postShareId) => `/comments/post-share/${postShareId}`,

  FRIENDSHIP: "/friendship",
  NOTIFICATIONS: "/notifications",

  FORGOT_PASSWORD: "/email/forgot-password",
  VERIFY_OTP: "/email/verify-otp",
  RESET_PASSWORD: "/email/reset-password",
};
