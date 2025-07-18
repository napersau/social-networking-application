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
};
