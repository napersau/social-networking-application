package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserIdAndPostId(Long userId, Long postId);
    Optional<Like> findByUserIdAndPostShareId(Long userId, Long postShareId);
    Optional<Like> findByUserIdAndCommentId(Long userId, Long commentId);
    List<Like> findAllByPostShareId(Long postId);
    List<Like> findAllByUserIdAndPostIdIn(Long userId, List<Long> postIds);
    Integer countByPostShareId(Long postId);
    Integer countByPostId(Long postId);
}
