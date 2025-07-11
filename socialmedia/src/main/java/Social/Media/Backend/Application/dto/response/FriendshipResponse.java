package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.User;
import lombok.Data;

import java.time.Instant;

@Data
public class FriendshipResponse {
    private Long id;
    private String status;
    private User user;
    private User friend;
    private Instant createdAt;
    private Instant updatedAt;
}
