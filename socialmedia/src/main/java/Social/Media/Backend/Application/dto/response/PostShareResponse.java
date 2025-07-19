package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.Post;
import Social.Media.Backend.Application.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class PostShareResponse {
    private Long id;
    private String sharedContent;
    private Instant createdAt;
    private User user;
    private Post post;
}
