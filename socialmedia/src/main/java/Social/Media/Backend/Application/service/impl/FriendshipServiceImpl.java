package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.FriendshipRequest;
import Social.Media.Backend.Application.dto.response.FriendshipResponse;
import Social.Media.Backend.Application.entity.Friendship;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.FriendshipRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.FriendshipService;
import Social.Media.Backend.Application.utils.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendshipServiceImpl implements FriendshipService {
    private final SecurityUtil securityUtil;
    private final FriendshipRepository friendshipRepository;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;

    @Override
    public FriendshipResponse createFriendship(FriendshipRequest request) {
        User user = securityUtil.getCurrentUser();

        User friend = userRepository.findById(request.getFriendId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Friendship friendship = Friendship.builder()
                .user(user)
                .friend(friend)
                .status(request.getStatus())
                .createdAt(Instant.now())
                .build();
        friendshipRepository.save(friendship);
        return modelMapper.map(friendship, FriendshipResponse.class);
    }

    @Override
    public FriendshipResponse respondToFriendRequest(FriendshipRequest request) {
        Friendship friendship = friendshipRepository.findByUserIdAndFriendId(request.getUserId(), request.getFriendId());
        friendship.setUpdatedAt(Instant.now());
        FriendshipResponse friendshipResponse = modelMapper.map(friendship, FriendshipResponse.class);
        friendshipResponse.setStatus(request.getStatus());
        if(request.getStatus().equals("ACCEPTED")){
            friendship.setStatus("ACCEPTED");
            friendshipRepository.save(friendship);
        }
        else if(request.getStatus().equals("REJECTED")){
            friendshipRepository.delete(friendship);
        }
        return friendshipResponse;
    }


    @Override
    public List<FriendshipResponse> getFriendshipRequest() {
        User user = securityUtil.getCurrentUser();
        List<Friendship> friendshipList = friendshipRepository.findAllByFriendIdAndStatusNot(user.getId(), "ACCEPTED");
        return friendshipList.stream().map(friendship -> modelMapper.map(friendship, FriendshipResponse.class)).toList();
    }

    @Override
    public List<FriendshipResponse> getFriendship() {

        User user = securityUtil.getCurrentUser();

        List<Friendship> friendshipList = friendshipRepository.findAllFriendshipsByUserIdAndStatus(user.getId(), "ACCEPTED");
        return friendshipList.stream().map(friendship -> modelMapper.map(friendship, FriendshipResponse.class)).toList();
    }

    @Override
    public FriendshipResponse getFriendshipStatus(Long userId) {

        User user = securityUtil.getCurrentUser();

        Friendship friendship = friendshipRepository.findFriendshipBetween(user.getId(), userId);

        if (friendship == null) {
            return null;
        }

        return modelMapper.map(friendship, FriendshipResponse.class);
    }


}
