package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.CommentRequest;
import Social.Media.Backend.Application.dto.response.CommentResponse;
import Social.Media.Backend.Application.entity.Comment;
import Social.Media.Backend.Application.entity.Post;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.CommentRepository;
import Social.Media.Backend.Application.repository.PostRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.CommentService;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Override
    public CommentResponse createComment(CommentRequest request) {

        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Post post = postRepository.findById(request.getPostId()).orElseThrow(()
                -> new AppException(ErrorCode.POST_NOT_EXISTED));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .imageUrl(request.getImageUrl())
                .post(post)
                .createdAt(Instant.now())
                .build();
        commentRepository.save(comment);
        return modelMapper.map(comment, CommentResponse.class);
    }

    @Override
    public CommentResponse updateComment(CommentRequest request, Long id) {

        Comment comment = commentRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Comment not found"));
        comment.setUpdatedAt(Instant.now());
        comment.setContent(request.getContent());
        commentRepository.save(comment);

        return modelMapper.map(comment, CommentResponse.class);
    }

    @Override
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
