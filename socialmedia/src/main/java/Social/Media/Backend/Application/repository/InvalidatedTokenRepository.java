package Social.Media.Backend.Application.repository;

import Social.Media.Backend.Application.entity.InvalidatedToken;
import jdk.jfr.Registered;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
}
