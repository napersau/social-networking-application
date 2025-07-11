import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

// Lấy danh sách bạn bè
export const getFriendsRequests = async () => {
  return await httpClient.get(API.FRIENDSHIP, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

// Gửi yêu cầu kết bạn
export const createFriendship = async (friendshipRequest) => {
  return await httpClient.post(API.FRIENDSHIP, friendshipRequest, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

// Chấp nhận hoặc từ chối lời mời
export const createFriendshipResponse = async (friendId, userId ,status) => {
  return await httpClient.post(`${API.FRIENDSHIP}/respond`, {
    friendId,
    userId,
    status, // true hoặc false
  }, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};