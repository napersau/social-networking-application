package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.WebSocketSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebSocketSessionRepository extends JpaRepository<WebSocketSession, Long> {
    void deleteBySocketSessionId(String socketSessionId);
    List<WebSocketSession> findAllByUserIdIn(List<Long> userIds);
}
