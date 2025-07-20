package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.PostShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostShareRepository extends JpaRepository<PostShare, Long> {
    List<PostShare> findAllByUserId(Long userId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
}
