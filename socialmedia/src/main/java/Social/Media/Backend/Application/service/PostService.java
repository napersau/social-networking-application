package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.PostRequest;
import Social.Media.Backend.Application.dto.response.PostResponse;

public interface PostService {
    PostResponse createPost(PostRequest request);
}
