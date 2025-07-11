package Social.Media.Backend.Application.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FriendshipRequest {
    private Long userId;
    private Long friendId;
    private String status;
}
