package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.Media;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    @Query("SELECT m FROM Media m WHERE m.sourceType = :type AND m.sourceId = :id")
    List<Media> findBySource(@Param("type") String type, @Param("id") Long id);
}
