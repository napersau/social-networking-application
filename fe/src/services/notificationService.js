import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

// Lấy danh sách thông báo
export const getNotifications = async () => {
  return await httpClient.get(API.NOTIFICATIONS, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

// Tạo thông báo mới
export const createNotification = async (notificationData) => {
  return await httpClient.post(API.NOTIFICATIONS, notificationData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

// Cập nhật thông báo theo ID (ví dụ: đã đọc)
export const updateNotification = async (id) => {
  return await httpClient.post(`${API.NOTIFICATIONS}/update/${id}`, null, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const deleteNotification = async (id) => {
  return await httpClient.delete(`${API.NOTIFICATIONS}/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};
