package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.PostShareRequest;
import Social.Media.Backend.Application.dto.response.PostShareResponse;

import java.util.List;

public interface PostShareService {
    List<PostShareResponse> getPostShares();
    PostShareResponse createPostShare(PostShareRequest request);
    void deletePostShare(Long id);
    List<PostShareResponse> getPostSharesByUserId(Long userId);
}
