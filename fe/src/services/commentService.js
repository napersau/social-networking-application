import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

export const commentService = {
  /**
   * Gửi comment cho một bài viết
   * @param {number} postId - ID của bài viết
   * @param {string} content - Nội dung comment
   * @returns {Promise} - Kết quả từ API
   */
  createComment: async (postId, content) => {
    return await httpClient.post(
      API.CREATE_COMMENT || "/api/v1/comments/create",
      {
        postId,
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  /**
   * Gửi comment cho một post share
   * @param {number} postShareId - ID của post share
   * @param {string} content - Nội dung comment
   * @returns {Promise} - Kết quả từ API
   */
  createCommentForPostShare: async (postShareId, content) => {
    return await httpClient.post(
      API.CREATE_COMMENT || "/api/v1/comments/create",
      {
        postShareId,
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  updateComment: async (commentId, content) => {
    return await httpClient.post(
      `/comments/update/${commentId}`,
      { content }, // gửi content
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  deleteComment: async (id) => {
    return await httpClient.delete(
      `${API.DELETE_COMMENT(id) || `/api/v1/comments/${id}`}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
  },

  replyComment: async (postId, commentId, content, imageUrl = null) => {
    return await httpClient.post(
      API.REPLY_COMMENT || "/api/v1/comments/reply",
      {
        postId,
        commentId, // ID của comment cha (reply vào comment này)
        content,
        imageUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  /**
   * Trả lời comment trong post share
   * @param {number} postShareId - ID của post share
   * @param {number} commentId - ID của comment cha
   * @param {string} content - Nội dung reply
   * @param {string} imageUrl - URL hình ảnh (optional)
   * @returns {Promise} - Kết quả từ API
   */
  replyCommentForPostShare: async (postShareId, commentId, content, imageUrl = null) => {
    return await httpClient.post(
      API.REPLY_COMMENT || "/api/v1/comments/reply",
      {
        postShareId,
        commentId, // ID của comment cha (reply vào comment này)
        content,
        imageUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  getCommentsByPostId: async (postId) => {
    return await httpClient.get(
      `${
        API.GET_COMMENTS_BY_POST_ID?.replace(":postId", postId) ||
        `/comments/${postId}`
      }`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
  },

  /**
   * Lấy danh sách comment cho một post share
   * @param {number} postShareId - ID của post share
   * @returns {Promise} - Kết quả từ API
   */
  getCommentsByPostShareId: async (postShareId) => {
    return await httpClient.get(
      `/comments/postShare/${postShareId}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
  },
};
