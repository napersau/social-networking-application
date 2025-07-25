package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.PostRequest;
import Social.Media.Backend.Application.dto.response.PostResponse;
import Social.Media.Backend.Application.entity.Post;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.mapper.PostMapper;
import Social.Media.Backend.Application.repository.LikeRepository;
import Social.Media.Backend.Application.repository.PostRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.PostService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ModelMapper modelMapper;
    private final LikeRepository likeRepository;
    private final PostMapper postMapper;

    @Override
    public PostResponse createPost(PostRequest request) {

        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Post post = modelMapper.map(request, Post.class);
        post.setUser(user);
        post.setCreatedAt(Instant.now());
        postRepository.save(post);
        return modelMapper.map(post, PostResponse.class);
    }

    @Override
    public List<PostResponse> getPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream().map(post -> modelMapper.map(post, PostResponse.class)).toList();
    }

    @Override
    public List<PostResponse> getPostsByUser() {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        List<Post> posts = postRepository.findAllByUserId(user.getId());
        List<PostResponse> result =  posts.stream().map(postMapper::toPostResponse).toList();
        for(PostResponse postResponse : result){
            postResponse.setIsLiked(likeRepository.findByUserIdAndPostId(user.getId(), postResponse.getId()).isPresent());
        }
        return result;
    }

    @Override
    public List<PostResponse> getPostsByUserId(Long userId) {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        List<Post> posts = postRepository.findAllByUserId(userId);
        List<PostResponse> result =  posts.stream().map(post -> modelMapper.map(post, PostResponse.class)).toList();
        for(PostResponse postResponse : result){
            postResponse.setIsLiked(likeRepository.findByUserIdAndPostId(user.getId(), postResponse.getId()).isPresent());
        }
        return result;
    }

    @Override
    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}
