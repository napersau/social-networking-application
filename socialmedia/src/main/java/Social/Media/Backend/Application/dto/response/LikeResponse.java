package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.User;
import lombok.Data;

@Data
public class LikeResponse {
    private Long id;
    private User user;
    private String reactionType;
    private Long postId;
    private Long postShareId;
    private Long commentId;
}
