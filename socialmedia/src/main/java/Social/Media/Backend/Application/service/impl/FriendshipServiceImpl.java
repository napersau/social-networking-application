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

    private final FriendshipRepository friendshipRepository;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;

    @Override
    public FriendshipResponse createFriendship(FriendshipRequest request) {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
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
    public List<FriendshipResponse> getFriendship() {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        List<Friendship> friendshipList = friendshipRepository.findAllByFriendIdAndStatusNot(user.getId(), "ACCEPTED");
        return friendshipList.stream().map(friendship -> modelMapper.map(friendship, FriendshipResponse.class)).toList();
    }

}
