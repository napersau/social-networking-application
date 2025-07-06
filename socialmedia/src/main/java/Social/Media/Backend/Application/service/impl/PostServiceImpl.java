package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.PostRequest;
import Social.Media.Backend.Application.dto.response.PostResponse;
import Social.Media.Backend.Application.entity.Post;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.PostRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.PostService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ModelMapper modelMapper;

    @Override
    public PostResponse createPost(PostRequest request) {

        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Post post = modelMapper.map(request, Post.class);
        post.setUser(user);
        post.setCreatedAt(Instant.now());

        return modelMapper.map(post, PostResponse.class);
    }
}
