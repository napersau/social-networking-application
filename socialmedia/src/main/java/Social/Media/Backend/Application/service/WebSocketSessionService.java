package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.entity.WebSocketSession;

public interface WebSocketSessionService {
    WebSocketSession create(WebSocketSession webSocketSession);
    void deleteSession(String sessionId);
}
