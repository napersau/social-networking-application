package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.ChatMessage;
import jdk.jfr.Registered;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findAllByConversationIdOrderByCreatedDateDesc(Long conversationId);
}
