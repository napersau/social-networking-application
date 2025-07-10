package Social.Media.Backend.Application.dto.request;

import lombok.Data;

@Data
public class FriendshipRequest {
    private Long userId;
    private Long friendId;
    private String status;
}
