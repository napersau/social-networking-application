package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.CommentRequest;
import Social.Media.Backend.Application.dto.response.CommentResponse;

import java.util.List;

public interface CommentService {
    CommentResponse createComment(CommentRequest request);
    CommentResponse updateComment(CommentRequest request, Long id);
    void deleteComment(Long id);
    CommentResponse replyComment(CommentRequest request);
    List<CommentResponse> getCommentsByPostId(Long postId);
    List<CommentResponse> getCommentsByPostShareId(Long postShareId);
}
