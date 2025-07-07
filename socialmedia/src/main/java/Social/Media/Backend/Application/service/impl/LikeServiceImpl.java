package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.LikeRequest;
import Social.Media.Backend.Application.dto.response.LikeResponse;
import Social.Media.Backend.Application.entity.Like;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.LikeRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;


@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final ModelMapper modelMapper;

    @Override
    public LikeResponse likePost(LikeRequest request) {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if(likeRepository.findByUserIdAndPostId(user.getId(), request.getPostId()).isPresent()){
            likeRepository.deleteByUserIdAndPostId(user.getId(), request.getPostId());
            return null;
        }
        Like like = modelMapper.map(request, Like.class);
        like.setUser(user);
        like.setCreatedAt(Instant.now());
        likeRepository.save(like);
        return modelMapper.map(like, LikeResponse.class);
    }
}
