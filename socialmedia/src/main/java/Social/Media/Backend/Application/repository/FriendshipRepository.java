package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findAllByFriendIdAndStatusNot(Long friendId, String status);
    List<Friendship> findAllByUserId(Long userId);
    Friendship findByUserIdAndFriendId(Long userId, Long friendId);
}
