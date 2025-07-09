package Social.Media.Backend.Application.repository;


import Social.Media.Backend.Application.entity.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    List<User> findByUsernameContaining(String username);

    @Query("SELECT u FROM User u WHERE CONCAT(u.firstName, ' ', u.lastName) LIKE %:name%")
    List<User> searchByFullName(@Param("name") String name);
}
