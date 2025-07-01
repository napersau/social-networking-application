package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("SELECT c FROM Conversation c " +
            "WHERE c.isGroup = false " +
            "AND EXISTS (SELECT p1 FROM c.participants p1 WHERE p1.user.id = :userId1) " +
            "AND EXISTS (SELECT p2 FROM c.participants p2 WHERE p2.user.id = :userId2) " +
            "AND (SELECT COUNT(p) FROM c.participants p) = 2")
    Optional<Conversation> findPrivateConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT c FROM Conversation c WHERE EXISTS (SELECT p FROM c.participants p WHERE p.user.id = :userId)")
    List<Conversation> findConversationsByUserId(@Param("userId") Long userId);
}