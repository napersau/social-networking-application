package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.entity.WebSocketSession;

import java.util.List;

public interface WebSocketSessionService {
    WebSocketSession create(WebSocketSession webSocketSession);
    Long deleteSession(String sessionId);
    List<Long> getOnlineUsers();
    void handleTypingStatus(Long conversationId, Long userId, Boolean isTyping);
    String getSessionIdForUser(Long userId);
    Long getUserIdBySessionId(String sessionId);
}
