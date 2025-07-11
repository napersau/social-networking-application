package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.Friendship;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findAllByFriendIdAndStatusNot(Long friendId, String status);
    @Query("SELECT f FROM Friendship f " +
            "WHERE (f.user.id = :userId OR f.friend.id = :userId) " +
            "AND f.status = :status")
    List<Friendship> findAllFriendshipsByUserIdAndStatus(@Param("userId") Long userId,
                                                         @Param("status") String status);
    List<Friendship> findAllByUserId(Long userId);
    Friendship findByUserIdAndFriendId(Long userId, Long friendId);
}
