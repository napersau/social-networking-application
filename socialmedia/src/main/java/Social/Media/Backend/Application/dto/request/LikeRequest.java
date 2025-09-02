package Social.Media.Backend.Application.dto.request;

import lombok.Data;

@Data
public class LikeRequest {
    private Long postId;
    private Long cmtId;
    private String reactionType;
    private Long postShareId;
}
