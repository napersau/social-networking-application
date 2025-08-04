package Social.Media.Backend.Application.repository;


import Social.Media.Backend.Application.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByParticipantsHash(String hash);

//    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.userId = :userId")
//    List<Conversation> findAllByParticipantIdsContains(Long userId);
    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.userId = :userId ORDER BY c.modifiedDate DESC")
    List<Conversation> findAllByUserIdOrderByModifiedDateDesc(@Param("userId") Long userId);


}
