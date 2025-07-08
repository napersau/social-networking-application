package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.Comment;
import Social.Media.Backend.Application.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PostResponse {
    private Long id;
    private Boolean isLiked;
    private User user;
    private List<LikeResponse> likes;
    private List<Comment> comments;
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
