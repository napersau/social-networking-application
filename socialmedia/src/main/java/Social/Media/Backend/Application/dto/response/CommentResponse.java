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
    private Comment parentComment;
    private Integer likesCount;
    private Boolean isActive;
    private List<Comment> replies;
    private Instant createdAt;
    private Instant updatedAt;
}
