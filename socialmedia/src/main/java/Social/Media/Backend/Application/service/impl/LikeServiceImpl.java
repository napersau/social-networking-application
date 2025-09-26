package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.LikeRequest;
import Social.Media.Backend.Application.dto.response.LikeResponse;
import Social.Media.Backend.Application.entity.*;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.*;
import Social.Media.Backend.Application.service.LikeService;
import Social.Media.Backend.Application.utils.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class LikeServiceImpl implements LikeService {

    private final SecurityUtil securityUtil;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final PostShareRepository postShareRepository;
    private final ModelMapper modelMapper;

    @Override
    public LikeResponse likePost(LikeRequest request) {

        User user = securityUtil.getCurrentUser();

        if(likeRepository.findByUserIdAndPostId(user.getId(), request.getPostId()).isPresent()){
            Like like = likeRepository.findByUserIdAndPostId(user.getId(), request.getPostId()).get();
            likeRepository.delete(like);
            return null;
        }
        Post post =  postRepository.findById(request.getPostId()).orElseThrow(()
                -> new AppException(ErrorCode.POST_NOT_EXISTED));

        Like like = buildLike(user, request.getReactionType(), post, null);

        likeRepository.save(like);
        return modelMapper.map(like, LikeResponse.class);
    }

    @Override
    public LikeResponse likeComment(LikeRequest request) {

        User user = securityUtil.getCurrentUser();

        if(likeRepository.findByUserIdAndCommentId(user.getId(), request.getCmtId()).isPresent()){
            Like like = likeRepository.findByUserIdAndCommentId(user.getId(), request.getCmtId()).get();
            likeRepository.delete(like);
            return null;
        }
        Comment comment = commentRepository.findById(request.getCmtId()).orElseThrow(()
                -> new RuntimeException("Comment not found"));
        Like like = buildLike(user, request.getReactionType(), null, comment);
        likeRepository.save(like);
        return modelMapper.map(like, LikeResponse.class);
    }

    @Override
    public LikeResponse likePostShare(LikeRequest request) {
        User user = securityUtil.getCurrentUser();

        if(likeRepository.findByUserIdAndPostShareId(user.getId(), request.getPostShareId()).isPresent()){
            Like like = likeRepository.findByUserIdAndPostShareId(user.getId(), request.getPostShareId()).get();
            likeRepository.delete(like);
            return null;
        }

        PostShare post =  postShareRepository.findById(request.getPostShareId()).orElseThrow(()
                -> new AppException(ErrorCode.POST_SHARE_NOT_EXISTED));

        Like like = Like.builder()
                .user(user)
                .reactionType(request.getReactionType())
                .postShare(post)
                .createdAt(Instant.now())
                .build();

        likeRepository.save(like);
        return modelMapper.map(like, LikeResponse.class);
    }

    @Override
    public List<LikeResponse> getLikesByPostShareId(Long postShareId) {
        List<Like> likes = likeRepository.findAllByPostShareId(postShareId);
        return likes.stream()
                .map(like -> modelMapper.map(like, LikeResponse.class))
                .toList();
    }

    @Override
    public List<LikeResponse> getLikesByPostId(Long postId) {
        List<Like> likes = likeRepository.findAllByPostIdAndPostShareIdIsNull(postId);
        return likes.stream()
                .map(like -> modelMapper.map(like, LikeResponse.class))
                .toList();
    }

    private Like buildLike(User user, String reactionType, Post post, Comment comment) {
        return Like.builder()
                .user(user)
                .reactionType(reactionType)
                .post(post)
                .comment(comment)
                .createdAt(Instant.now())
                .build();
    }
}
