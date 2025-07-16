import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

// Lấy danh sách tất cả lời mời bạn bè (gửi/nhận)
export const getFriendsRequests = async () => {
  return await httpClient.get(API.FRIENDSHIP, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

// Gửi lời mời kết bạn
export const createFriendship = async (friendshipRequest) => {
  return await httpClient.post(API.FRIENDSHIP, friendshipRequest, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

// Phản hồi lời mời (chấp nhận hoặc từ chối)
export const createFriendshipResponse = async (friendId, userId, status) => {
  return await httpClient.post(
    `${API.FRIENDSHIP}/respond`,
    {
      friendId,
      userId,
      status, // true: chấp nhận, false: từ chối
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

// Lấy danh sách bạn bè đã được chấp nhận
export const getMyFriends = async () => {
  return await httpClient.get(`${API.FRIENDSHIP}/my-friend`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

// ✅ Lấy trạng thái kết bạn giữa mình và người khác
export const getFriendshipStatus = async (userId) => {
  return await httpClient.get(`${API.FRIENDSHIP}/status`, {
    params: { userId },
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};
