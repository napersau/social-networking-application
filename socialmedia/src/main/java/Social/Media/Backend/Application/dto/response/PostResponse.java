package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
public class PostResponse {
    private Long id;
    private User user;
    private String content;
    private String imageUrl;
    private String videoUrl;
    private String location;
    private String privacy;
    private Boolean isActive;
    private Integer likesCount;
    private Integer commentsCount;
    private Integer sharesCount;
    private Instant createdAt;
    private Instant updatedAt;
}
