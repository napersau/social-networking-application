package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.LikeRequest;
import Social.Media.Backend.Application.dto.response.LikeResponse;

import java.util.List;

public interface LikeService {
    LikeResponse likePost(LikeRequest request);
    LikeResponse likeComment(LikeRequest request);
    LikeResponse likePostShare(LikeRequest request);
    List<LikeResponse> getLikesByPostShareId(Long postShareId);
}
