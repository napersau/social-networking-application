package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.PostShareRequest;
import Social.Media.Backend.Application.dto.response.PostShareResponse;
import Social.Media.Backend.Application.entity.Post;
import Social.Media.Backend.Application.entity.PostShare;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.*;
import Social.Media.Backend.Application.service.PostShareService;
import Social.Media.Backend.Application.utils.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostShareServiceImpl implements PostShareService {
    private final SecurityUtil securityUtil;
    private final PostShareRepository postShareRepository;
    private final LikeRepository likeRepository;
    private final ModelMapper modelMapper;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Override
    public List<PostShareResponse> getPostShares() {

        User user = securityUtil.getCurrentUser();

        List<PostShare> postShareResponses = postShareRepository.findAllByUserId(user.getId());
        List<PostShareResponse> postShareResponseList = postShareResponses
                .stream()
                .map(postShare -> modelMapper.map(postShare, PostShareResponse.class))
                .toList();
        return getPostShareResponses(user, postShareResponseList);
    }

    @Override
    public PostShareResponse createPostShare(PostShareRequest request) {

        User user = securityUtil.getCurrentUser();

        Post post = postRepository.findById(request.getPostId()).orElseThrow(() ->
                new AppException(ErrorCode.POST_NOT_EXISTED)) ;

        if(postShareRepository.existsByPostIdAndUserId(request.getPostId(), user.getId())) {
            throw new RuntimeException("Post Share Exists");
        }

        PostShare postShare = PostShare.builder()
                .user(user)
                .post(post)
                .createdAt(Instant.now())
                .sharedContent(request.getSharedContent())
                .build();
        postShareRepository.save(postShare);

        return modelMapper.map(postShare, PostShareResponse.class);
    }

    @Override
    public void deletePostShare(Long id) {
        postShareRepository.deleteById(id);
    }

    @Override
    public List<PostShareResponse> getPostSharesByUserId(Long userId) {
        List<PostShare> postShares = postShareRepository.findAllByUserId(userId);
        User user = securityUtil.getCurrentUser();
        List<PostShareResponse> responses = postShares
                .stream()
                .map(postShare -> modelMapper.map(postShare, PostShareResponse.class))
                .toList();
        return getPostShareResponses(user, responses);
    }

    private List<PostShareResponse> getPostShareResponses(User user, List<PostShareResponse> responses) {
        for (PostShareResponse response : responses) {
            likeRepository.findByUserIdAndPostShareId(user.getId(), response.getId())
                    .ifPresentOrElse(like -> {
                        response.setIsLiked(true);
                        response.setReactionType(like.getReactionType());
                    }, () -> {
                        response.setIsLiked(false);
                        response.setReactionType(null);
                    });

            Integer commentCount = commentRepository.countByPostShareId(response.getId());
            response.setCommentsCount(commentCount);
        }
        return responses;
    }
}
