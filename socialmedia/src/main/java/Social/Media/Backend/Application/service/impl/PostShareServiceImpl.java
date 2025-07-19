package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.PostShareRequest;
import Social.Media.Backend.Application.dto.response.PostShareResponse;
import Social.Media.Backend.Application.entity.Post;
import Social.Media.Backend.Application.entity.PostShare;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.PostRepository;
import Social.Media.Backend.Application.repository.PostShareRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.PostShareService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostShareServiceImpl implements PostShareService {

    private final PostShareRepository postShareRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PostRepository postRepository;

    @Override
    public List<PostShareResponse> getPostShares() {

        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<PostShare> postShareResponses = postShareRepository.findAllByUserId(user.getId());
        return postShareResponses.stream().map(postShare -> modelMapper.map(postShare, PostShareResponse.class)).toList();
    }

    @Override
    public PostShareResponse createPostShare(PostShareRequest request) {

        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Post post = postRepository.findById(request.getPostId()).orElseThrow(() ->
                new AppException(ErrorCode.POST_NOT_EXISTED)) ;

        PostShare postShare = PostShare.builder()
                .user(user)
                .post(post)
                .createdAt(Instant.now())
                .sharedContent(request.getSharedContent())
                .build();
        postShareRepository.save(postShare);

        return modelMapper.map(postShare, PostShareResponse.class);
    }
}
