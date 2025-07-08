export const OAuthConfig = {
  
};

export const CONFIG = {
  API_GATEWAY: "http://localhost:8080/api/v1",
};

export const API = {
  LOGIN: "/identity/auth/token",
  MY_INFO: "/profile/users/my-profile",
  MY_POST: "/post/my-posts",
  CREATE_POST: "/post/create",
  UPDATE_PROFILE: "/profile/users/my-profile",
  UPDATE_AVATAR: "/profile/users/avatar",
  SEARCH_USER: "/users/search",
  MY_CONVERSATIONS: "/chat/conversations/my-conversations",
  CREATE_CONVERSATION: "/chat/conversations/create",
  CREATE_MESSAGE: "/chat/messages/create",
  GET_CONVERSATION_MESSAGES: "/chat/messages",
  CREATE_POST: "/posts",
  GET_POSTS:"/posts/user",
  GET_POST_BY_ID:"/posts/${postId}",

  LIKE_POST: "/like",           // POST - like a post
  UNLIKE_POST: "/{postId}/like", // DELETE - unlike a post
  TOGGLE_LIKE: "/like",               // POST - toggle like/unlike
  GET_POST_LIKES: "/{postId}/likes",     // GET - get users who liked a post
  CHECK_LIKE_STATUS: "/{postId}/like-status", // GET - check if user liked a post
  GET_LIKE_COUNT: "/{postId}/like-count",     // GET - get like count for a post
  GET_USER_LIKES: "/users/{userId}/likes",          // GET - get posts liked by user
  GET_MY_LIKES: "/users/me/likes",   
  
  CREATE_COMMENT: "/comments/create",
  UPDATE_COMMENT: "/comments/update",
};