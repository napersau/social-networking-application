package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.PostRequest;
import Social.Media.Backend.Application.dto.response.PostResponse;

import java.util.List;

public interface PostService {
    PostResponse createPost(PostRequest request);
    List<PostResponse> getPosts();
    List<PostResponse> getPostsByUser();
    List<PostResponse> getPostsByUserId(Long userId);
    void deletePost(Long id);
    PostResponse updatePost(PostRequest request, Long id);
}
