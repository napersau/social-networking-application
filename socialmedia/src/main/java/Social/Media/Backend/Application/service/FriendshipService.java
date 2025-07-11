package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.FriendshipRequest;
import Social.Media.Backend.Application.dto.response.FriendshipResponse;
import Social.Media.Backend.Application.entity.Friendship;

import java.util.List;

public interface FriendshipService {
    FriendshipResponse createFriendship(FriendshipRequest request);
    FriendshipResponse respondToFriendRequest(FriendshipRequest request);
    List<FriendshipResponse> getFriendshipRequest();
    List<FriendshipResponse> getFriendship();
}
