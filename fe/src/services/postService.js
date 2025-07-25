import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

export const postService = {
  // Tạo bài viết mới
  createPost: async (postData) => {
    return await httpClient.post(API.CREATE_POST || "/api/v1/posts", postData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  },

  // Lấy danh sách tất cả bài viết
  getPosts: async () => {
    return await httpClient.get(API.GET_POSTS || "/api/v1/posts/user", {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  getPostsByUserId: async (userId) => {
    return await httpClient.get(API.GET_POSTS_BY_USERID(userId) , {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Lấy bài viết theo ID
  getPostById: async (postId) => {
    return await httpClient.get(API.GET_POST_BY_ID || `/api/v1/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Cập nhật bài viết
  updatePost: async (postId, postData) => {
    return await httpClient.put(API.UPDATE_POST || `/api/v1/posts/${postId}`, postData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  },

  // Xóa bài viết
  deletePost: async (postId) => {
    return await httpClient.delete(API.DELETE_POST(postId) || `/api/v1/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Thích bài viết
  likePost: async (postId) => {
    return await httpClient.post(API.LIKE_POST || `/api/v1/posts/${postId}/like`, {}, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  },

  // Bỏ thích bài viết
  unlikePost: async (postId) => {
    return await httpClient.delete(API.UNLIKE_POST || `/api/v1/posts/${postId}/like`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Lấy danh sách bài viết của người dùng
  getUserPosts: async (userId) => {
    return await httpClient.get(API.GET_USER_POSTS || `/api/v1/posts/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Lấy bài viết của người dùng hiện tại
  getMyPosts: async () => {
    return await httpClient.get(API.GET_MY_POSTS || "/api/v1/posts/me", {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Tìm kiếm bài viết
  searchPosts: async (keyword) => {
    return await httpClient.get(API.SEARCH_POSTS || `/api/v1/posts/search`, {
      params: { keyword },
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Lấy bài viết theo hashtag
  getPostsByHashtag: async (hashtag) => {
    return await httpClient.get(API.GET_POSTS_BY_HASHTAG || `/api/v1/posts/hashtag/${hashtag}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Lấy timeline (bài viết từ những người đang follow)
  getTimeline: async (page = 0, size = 10) => {
    return await httpClient.get(API.GET_TIMELINE || "/api/v1/posts/timeline", {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Upload ảnh cho bài viết
  uploadPostImage: async (formData) => {
    return await httpClient.post(API.UPLOAD_POST_IMAGE || "/api/v1/posts/upload-image", formData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Báo cáo bài viết
  reportPost: async (postId, reason) => {
    return await httpClient.post(API.REPORT_POST || `/api/v1/posts/${postId}/report`, 
      { reason }, 
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  // Chia sẻ bài viết
  sharePost: async (postId, shareData) => {
    return await httpClient.post(API.SHARE_POST || `/api/v1/posts/${postId}/share`, 
      shareData, 
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  // Lấy số lượng thống kê bài viết
  getPostStats: async (postId) => {
    return await httpClient.get(API.GET_POST_STATS || `/api/v1/posts/${postId}/stats`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Lấy danh sách người thích bài viết
  getPostLikes: async (postId, page = 0, size = 10) => {
    return await httpClient.get(API.GET_POST_LIKES || `/api/v1/posts/${postId}/likes`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  // Tăng view count cho bài viết
  incrementPostView: async (postId) => {
    return await httpClient.post(API.INCREMENT_POST_VIEW || `/api/v1/posts/${postId}/view`, {}, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  }
};

// Export default
export default postService;