package Social.Media.Backend.Application.dto.request;

import lombok.Data;

@Data
public class CommentRequest {
    private Long commentId;
    private String content;
    private Long postId;
    private Long parentCommentId;
    private String imageUrl;
    private Long postShareId;
}
