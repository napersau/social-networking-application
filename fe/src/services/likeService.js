// services/likeService.js
import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

export const likeService = {
  // Like hoặc thay đổi reaction
  likePost: async (postId, reactionType = "LIKE") => {
    return await httpClient.post(API.LIKE_POST || "/api/v1/like", {
      postId,
      reactionType,
    }, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  },

  // Toggle like/unlike (nếu backend xử lý chung 1 endpoint)
  toggleLike: async (likeData) => {
    return await httpClient.post(API.TOGGLE_LIKE || "/api/v1/like", likeData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  },

  // Toggle like/unlike comment (nếu backend xử lý chung 1 endpoint)
  toggleLikeComment: async (likeData) => {
    return await httpClient.post(API.TOGGLE_LIKE_COMMENT || "/api/v1/like/commnet", likeData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  },

  // Like post share
  likePostShare: async (likeData) => {
    return await httpClient.post(API.LIKE_POST_SHARE || "/like/postShare", likeData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  },

  // Lấy danh sách người đã like một bài post share
  getPostShareLikes: async (postShareId) => {
    return await httpClient.get(API.GET_POST_SHARE_LIKES(postShareId), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },



  // Lấy danh sách người đã like một bài viết
  getPostLikes: async (postId, page = 0, size = 10) => {
    return await httpClient.get(API.GET_POST_LIKES || `/api/v1/posts/${postId}/likes`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },


  // Kiểm tra user hiện tại đã like bài viết chưa
  checkLikeStatus: async (postId) => {
    return await httpClient.get(API.CHECK_LIKE_STATUS || `/api/v1/posts/${postId}/likes/status`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Lấy danh sách bài viết user đã like (theo user cụ thể)
  getUserLikes: async (userId) => {
    return await httpClient.get(API.GET_USER_LIKES || `/api/v1/users/${userId}/likes`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Lấy danh sách bài viết đã like của user hiện tại
  getMyLikes: async () => {
    return await httpClient.get(API.GET_MY_LIKES || `/api/v1/likes/me`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },


};

// Export default
export default likeService;
