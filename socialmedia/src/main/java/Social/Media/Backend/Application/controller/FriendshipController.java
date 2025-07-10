package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.FriendshipRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.FriendshipResponse;
import Social.Media.Backend.Application.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friendship")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @GetMapping
    ApiResponse<List<FriendshipResponse>> getFriends() {
        List<FriendshipResponse> friendshipResponseList = friendshipService.getFriendship();
        return ApiResponse.<List<FriendshipResponse>>builder()
                .code(1000)
                .result(friendshipResponseList)
                .build();
    }

    @PostMapping
    ApiResponse<FriendshipResponse> createFriendship (FriendshipRequest request){
        FriendshipResponse response = friendshipService.createFriendship(request);
        return ApiResponse.<FriendshipResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }
}
