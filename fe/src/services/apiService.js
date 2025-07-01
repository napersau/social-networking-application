import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động gắn Authorization header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const apiService = {
  // Lấy danh sách cuộc trò chuyện
  async getConversations() {
    try {
      const res = await apiClient.get('/messages/conversations');
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  // Lấy danh sách tất cả user
  async getAllUsers() {
    try {
      const res = await apiClient.get('/users');
      return res.data.result; // do backend trả theo ApiResponse
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Tạo cuộc trò chuyện mới với 1 user
  async createConversation(userId) {
    try {
      console.log(userId)
      const res = await apiClient.post('/conversations', { userId });
      return res.data.result;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Lấy tin nhắn trong cuộc trò chuyện
  async getMessages(conversationId, page = 0, size = 20) {
    try {
      const res = await apiClient.get(
        `/messages/conversations/${conversationId}/messages`,
        {
          params: { page, size },
        }
      );
      return res.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Đánh dấu đã đọc
  async markAsRead(conversationId) {
    try {
      await apiClient.post(`/messages/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },

  // Gửi tin nhắn
  async sendMessage(messageData) {
    try {
      const res = await apiClient.post('/messages/send', messageData);
      return res.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },
};

export default apiService;
