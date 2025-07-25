package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.Comment;
import Social.Media.Backend.Application.entity.Post;
import Social.Media.Backend.Application.entity.User;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private Long postId;
    private Long postShareId;
    private Long parentCommentId;
    private String imageUrl;
    private User user;
    private Boolean isActive;
    private List<CommentResponse> replies;
    private List<LikeResponse> likes;
    private Boolean isLiked;
    private Instant createdAt;
    private Instant updatedAt;
}
