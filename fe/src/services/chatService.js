import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

export const addUserToConversation = async (conversationId, userId) => {
  return httpClient.put(
    `${API.ADD_MEMBER_CONVERSATION}/${conversationId}?userId=${userId}`,
    {}, // body trống
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

export const removeUserFromConversation = async (conversationId, userId) => {
  return httpClient.put(
    `${API.REMOVE_MEMBER_CONVERSATION}/${conversationId}?userId=${userId}`,
    {}, // body trống
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};


export const getMyConversations = async () => {
  return await httpClient.get(API.MY_CONVERSATIONS, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const updateMessage = (messageId, data) => {
  return httpClient.put(`${API.MESSAGES}/${messageId}`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const createConversation = async (data) => {
  console.log(data)
  return await httpClient.post(
    API.CREATE_CONVERSATION,
    {
      type: data.type,
      participantIds: data.participantIds,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const createConversationGroup = async (data) => {
  console.log(data)
  return await httpClient.post(
    API.CREATE_CONVERSATION_GROUP,
    {
      type: data.type,
      name : data.name,
      participantIds: data.participantIds,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};


export const updateConversation = async (conversationId, data) => {
  return await httpClient.put(`${API.UPDATE_CONVERSATION}/${conversationId}`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
};

export const deleteConversation = async (conversationId) => {
  return await httpClient.delete(`${API.DELETE_CONVERSATION}/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};


export const createMessage = async (data) => {
  console.log("data",data)
  return await httpClient.post(
    API.CREATE_MESSAGE,
    {
      conversationId: data.conversationId,
      message: data.message,
      clientId: data.clientId,
      mediaUrls: data.mediaUrls
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const getMessages = async (conversationId) => {
  return await httpClient.get(`${API.MESSAGES}?conversationId=${conversationId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const recallMessage = async (messageId) => {
  return await httpClient.post(
    `${API.MESSAGES}/${messageId}`,
    {}, // nếu không có body, truyền object rỗng
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const markMessagesAsRead = async (conversationId) => {
  return await httpClient.put(
    `${API.MARK_MESSAGES_AS_READ}?conversationId=${conversationId}`,
    {}, // Không cần body
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const reactToMessage = async ({ id, conversationId, reactionType }) => {
  return await httpClient.put(
    API.REACT_TO_MESSAGE, // 👈 đảm bảo trong configuration có dòng này
    {
      id,
      conversationId,
      reactionType,
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};
