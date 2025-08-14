import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

/**
 * Lấy danh sách các bài post đã chia sẻ
 */
export const getPostShares = async () => {
  return await httpClient.get(API.POST_SHARE, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

/**
 * Tạo một bản chia sẻ bài viết mới
 * @param {Object} postShareData - Dữ liệu chia sẻ bài viết (ví dụ: { postId: 123, content: "..." })
 */
export const createPostShare = async (postShareData) => {
  return await httpClient.post(API.POST_SHARE, postShareData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const deletePostShare = async (id) => {
  return await httpClient.delete(`${API.POST_SHARE}/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};
