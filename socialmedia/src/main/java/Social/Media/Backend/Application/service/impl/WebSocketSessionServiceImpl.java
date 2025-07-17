package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.entity.WebSocketSession;
import Social.Media.Backend.Application.repository.WebSocketSessionRepository;
import Social.Media.Backend.Application.service.WebSocketSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketSessionServiceImpl implements WebSocketSessionService {

    private final WebSocketSessionRepository webSocketSessionRepository;

    @Override
    public WebSocketSession create(WebSocketSession webSocketSession) {
        return webSocketSessionRepository.save(webSocketSession);
    }

    @Override
    public void deleteSession(String sessionId) {
        webSocketSessionRepository.deleteBySocketSessionId(sessionId);
    }
}
