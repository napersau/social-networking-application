package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.entity.WebSocketSession;
import Social.Media.Backend.Application.repository.WebSocketSessionRepository;
import Social.Media.Backend.Application.service.TypingStatusService;
import Social.Media.Backend.Application.service.WebSocketSessionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WebSocketSessionServiceImpl implements WebSocketSessionService {

    private final WebSocketSessionRepository webSocketSessionRepository;
    private final TypingStatusService typingStatusService;

    @Override
    public WebSocketSession create(WebSocketSession webSocketSession) {
        return webSocketSessionRepository.save(webSocketSession);
    }

    @Override
    public Long deleteSession(String sessionId) {
        WebSocketSession session = webSocketSessionRepository.findBySocketSessionId(sessionId);
        webSocketSessionRepository.deleteBySocketSessionId(sessionId);
        return session.getUserId();
    }

    @Override
    public List<Long> getOnlineUsers() {
        return webSocketSessionRepository.findAll()
                .stream()
                .map(WebSocketSession::getUserId)
                .toList();
    }

    @Override
    public void handleTypingStatus(Long conversationId, Long userId, Boolean isTyping) {
        typingStatusService.updateTypingStatus(conversationId, userId, isTyping);
    }

  @Override
  public String getSessionIdForUser(Long userId) {
      WebSocketSession session = webSocketSessionRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
      return session != null ? session.getSocketSessionId() : null;
  }

    @Override
    public Long getUserIdBySessionId(String sessionId) {
        return webSocketSessionRepository.findBySocketSessionId(sessionId)
                .getUserId();
    }

}
