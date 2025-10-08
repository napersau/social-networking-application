
package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.TypingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TypingStatusRepository extends JpaRepository<TypingStatus, Long> {

    Optional<TypingStatus> findByConversationIdAndUserId(Long conversationId, Long userId);

    List<TypingStatus> findByConversationIdAndIsTyping(Long conversationId, Boolean isTyping);

    @Modifying
    @Query("DELETE FROM TypingStatus t WHERE t.conversationId = :conversationId AND t.userId = :userId")
    void deleteByConversationIdAndUserId(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE TypingStatus t SET t.isTyping = false WHERE t.lastUpdated < :expiredTime")
    void updateExpiredTypingStatus(@Param("expiredTime") LocalDateTime expiredTime);

    @Query("SELECT t FROM TypingStatus t WHERE t.conversationId = :conversationId AND t.isTyping = true AND t.userId != :excludeUserId")
    List<TypingStatus> findActiveTypingUsersExcept(@Param("conversationId") Long conversationId, @Param("excludeUserId") Long excludeUserId);
}