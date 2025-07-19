package Social.Media.Backend.Application.dto.request;

import Social.Media.Backend.Application.entity.Post;
import Social.Media.Backend.Application.entity.User;
import lombok.Data;

import java.time.Instant;

@Data
public class PostShareRequest {
    private String sharedContent;
    private Long postId;
    private Long id;
}
