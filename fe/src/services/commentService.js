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
    return await httpClient.post(API.CREATE_COMMENT || "/api/v1/comments/create", {
      postId,
      content,
    }, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  },

  /**
   * Cập nhật comment (nếu bạn muốn dùng sau này)
   */
  updateComment: async (commentId, newContent) => {
    return await httpClient.post(API.UPDATE_COMMENT || "/api/v1/comments/update", {
      commentId,
      content: newContent,
    }, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
  }
};
