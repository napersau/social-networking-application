import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

export const getMyInfo = async () => {
  return await httpClient.get(API.MY_INFO, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const updateProfile = async (profileData) => {
  return await httpClient.put(API.UPDATE_PROFILE, profileData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const uploadAvatar = async (formData) => {
  return await httpClient.put(API.UPDATE_AVATAR, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const searchUsers = async (keyword) => {
  return await httpClient.post(
    API.SEARCH_USER,
    { username: keyword },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const searchUsersByFullName = async (keyword) => {
  return await httpClient.post(
    API.SEARCH_USER_BY_FULLNAME,
    { fullName: keyword },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const getUserById = async (userId) => {
  return await httpClient.get(
    API.GET_USER(userId),
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const getAllUsers = async () => {
  return await httpClient.get(API.GET_ALL_USERS, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const toggleActiveUser = async (userId) => {
  return await httpClient.post(`${API.TOGGLE_ACTIVE_USER}/${userId}`, null, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

