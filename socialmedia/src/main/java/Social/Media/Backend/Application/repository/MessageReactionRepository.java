package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {
    Optional<MessageReaction> findByUserIdAndMessageId(Long userId, Long messageId);
}
