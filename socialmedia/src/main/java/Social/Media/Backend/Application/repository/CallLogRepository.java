package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CallLogRepository extends JpaRepository<CallLog, Long> {
    List<CallLog> findCallLogsByConversation(Long conversationId);
}
