package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.FriendshipRequest;
import Social.Media.Backend.Application.dto.response.FriendshipResponse;
import Social.Media.Backend.Application.entity.Friendship;

import java.util.List;

public interface FriendshipService {
    FriendshipResponse createFriendship(FriendshipRequest request);
    FriendshipResponse acceptFriendship(FriendshipRequest request);
    FriendshipResponse rejectFriendship(FriendshipRequest request);
    FriendshipResponse deleteFriendship(FriendshipRequest request);
    List<FriendshipResponse> getFriendship();
}
