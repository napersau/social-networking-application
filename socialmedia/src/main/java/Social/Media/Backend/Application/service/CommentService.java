package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.CommentRequest;
import Social.Media.Backend.Application.dto.response.CommentResponse;

public interface CommentService {
    CommentResponse createComment(CommentRequest request);
    void deleteComment(Long id);
}
