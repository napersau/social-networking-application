package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.User;
import lombok.Data;

@Data
public class FriendshipResponse {
    private Long id;
    private String status;
    private User user;
    private User friend;
    private Long createdAt;
    private Long updatedAt;
}
