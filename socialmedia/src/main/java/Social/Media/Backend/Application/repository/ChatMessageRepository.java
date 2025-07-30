package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findAllByConversationIdOrderByCreatedDateDesc(Long conversationId);

    @Query("SELECT COUNT(m) FROM ChatMessage m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.sender.userId <> :userId " +
            "AND m.isRead = false")
    int countUnreadMessages(@Param("conversationId") Long conversationId,
                            @Param("userId") Long userId);

    List<ChatMessage> findAllByConversationIdAndSenderIdNotAndIsReadFalse(Long conversationId, Long userId);
}
