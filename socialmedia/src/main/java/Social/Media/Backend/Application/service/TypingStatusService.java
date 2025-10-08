package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.response.TypingStatusDto;

import java.util.List;

public interface TypingStatusService {
    void updateTypingStatus(Long conversationId, Long userId, Boolean isTyping);
    List<TypingStatusDto> getTypingUsers(Long conversationId, Long excludeUserId);
    void cleanupExpiredTypingStatus();
    void removeUserTypingStatus(Long conversationId, Long userId);
}