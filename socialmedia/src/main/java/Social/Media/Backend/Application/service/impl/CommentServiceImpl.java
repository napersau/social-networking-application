package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.CommentRequest;
import Social.Media.Backend.Application.dto.response.CommentResponse;
import Social.Media.Backend.Application.dto.response.PostResponse;
import Social.Media.Backend.Application.entity.Comment;
import Social.Media.Backend.Application.entity.Post;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.mapper.CommentMapper;
import Social.Media.Backend.Application.repository.CommentRepository;
import Social.Media.Backend.Application.repository.LikeRepository;
import Social.Media.Backend.Application.repository.PostRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.CommentService;
import Social.Media.Backend.Application.utils.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final ModelMapper modelMapper;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final SecurityUtil securityUtil;
    private final LikeRepository likeRepository;

    @Override
    public CommentResponse createComment(CommentRequest request) {

        User user = securityUtil.getCurrentUser();

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

    @Override
    public CommentResponse replyComment(CommentRequest request) {

        User user = securityUtil.getCurrentUser();

        Post post = postRepository.findById(request.getPostId()).orElseThrow(()
                -> new AppException(ErrorCode.POST_NOT_EXISTED));

        Comment tmp = commentRepository.findById(request.getCommentId()).orElseThrow(() ->
                new RuntimeException("Comment not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .imageUrl(request.getImageUrl())
                .post(post)
                .createdAt(Instant.now())
                .parentComment(tmp)
                .build();
        commentRepository.save(comment);
        return modelMapper.map(comment, CommentResponse.class);
    }

    @Override
    public List<CommentResponse> getCommentsByPostId(Long postId) {

        User user = securityUtil.getCurrentUser();

        List<Comment> comments = commentRepository.findAllByPostId(postId);
        List<CommentResponse> commentResponses = comments.stream().map(commentMapper::toCommentResponse).toList();
        for(CommentResponse item : commentResponses){
            item.setIsLiked(likeRepository.findByUserIdAndCommentId(user.getId(), item.getId()).isPresent());
        }

        return commentResponses;
    }
}
