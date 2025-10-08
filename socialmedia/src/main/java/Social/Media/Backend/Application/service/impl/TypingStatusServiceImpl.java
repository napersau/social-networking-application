package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.response.TypingStatusDto;
import Social.Media.Backend.Application.entity.TypingStatus;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.repository.TypingStatusRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.TypingStatusService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TypingStatusServiceImpl implements TypingStatusService {

    private final TypingStatusRepository typingStatusRepository;
    private final UserRepository userRepository;

    @Override
    public void updateTypingStatus(Long conversationId, Long userId, Boolean isTyping) {
        try {
            Optional<TypingStatus> existingStatus = typingStatusRepository
                    .findByConversationIdAndUserId(conversationId, userId);

            if (existingStatus.isPresent()) {
                TypingStatus status = existingStatus.get();
                status.setIsTyping(isTyping);
                status.setLastUpdated(LocalDateTime.now());
                typingStatusRepository.save(status);
            } else {
                TypingStatus newStatus = TypingStatus.builder()
                        .conversationId(conversationId)
                        .userId(userId)
                        .isTyping(isTyping)
                        .lastUpdated(LocalDateTime.now())
                        .build();
                typingStatusRepository.save(newStatus);
            }

            log.info("Updated typing status for user {} in conversation {}: {}",
                    userId, conversationId, isTyping);

        } catch (Exception e) {
            log.error("Error updating typing status for user {} in conversation {}",
                    userId, conversationId, e);
        }
    }

    @Override
    public List<TypingStatusDto> getTypingUsers(Long conversationId, Long excludeUserId) {
        try {
            List<TypingStatus> typingStatuses = typingStatusRepository
                    .findActiveTypingUsersExcept(conversationId, excludeUserId);

            return typingStatuses.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting typing users for conversation {}", conversationId, e);
            return List.of();
        }
    }

    @Override
    public void cleanupExpiredTypingStatus() {
        try {
            LocalDateTime expiredTime = LocalDateTime.now().minusSeconds(10); // 10 seconds timeout
            typingStatusRepository.updateExpiredTypingStatus(expiredTime);
            log.debug("Cleaned up expired typing status");
        } catch (Exception e) {
            log.error("Error cleaning up expired typing status", e);
        }
    }

    @Override
    public void removeUserTypingStatus(Long conversationId, Long userId) {
        try {
            typingStatusRepository.deleteByConversationIdAndUserId(conversationId, userId);
            log.info("Removed typing status for user {} in conversation {}", userId, conversationId);
        } catch (Exception e) {
            log.error("Error removing typing status for user {} in conversation {}",
                    userId, conversationId, e);
        }
    }

    private TypingStatusDto convertToDto(TypingStatus typingStatus) {
        try {
            Optional<User> user = userRepository.findById(typingStatus.getUserId());
            if (user.isPresent()) {
                User userEntity = user.get();
                return TypingStatusDto.builder()
                        .userId(typingStatus.getUserId())
                        .username(userEntity.getUsername())
                        .avatarUrl(userEntity.getAvatarUrl())
                        .isTyping(typingStatus.getIsTyping())
                        .lastUpdated(typingStatus.getLastUpdated())
                        .build();
            }
        } catch (Exception e) {
            log.error("Error converting typing status to DTO for user {}",
                    typingStatus.getUserId(), e);
        }

        return TypingStatusDto.builder()
                .userId(typingStatus.getUserId())
                .isTyping(typingStatus.getIsTyping())
                .lastUpdated(typingStatus.getLastUpdated())
                .build();
    }
}