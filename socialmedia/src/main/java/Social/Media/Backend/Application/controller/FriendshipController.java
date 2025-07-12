package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.FriendshipRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.FriendshipResponse;
import Social.Media.Backend.Application.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friendship")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @GetMapping
    ApiResponse<List<FriendshipResponse>> getFriendsRequests() {
        List<FriendshipResponse> friendshipResponseList = friendshipService.getFriendshipRequest();
        return ApiResponse.<List<FriendshipResponse>>builder()
                .code(1000)
                .result(friendshipResponseList)
                .build();
    }

    @PostMapping
    ApiResponse<FriendshipResponse> createFriendship (@RequestBody FriendshipRequest request){
        FriendshipResponse response = friendshipService.createFriendship(request);
        return ApiResponse.<FriendshipResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @PostMapping("/respond")
    ApiResponse<FriendshipResponse> respondToFriendRequest (@RequestBody FriendshipRequest request){
        FriendshipResponse response = friendshipService.respondToFriendRequest(request);
        return ApiResponse.<FriendshipResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping("/my-friend")
    ApiResponse<List<FriendshipResponse>> getFriendship() {
        List<FriendshipResponse> friendshipResponseList = friendshipService.getFriendship();
        return ApiResponse.<List<FriendshipResponse>>builder()
                .code(1000)
                .result(friendshipResponseList)
                .build();
    }

    @GetMapping("/status")
    ApiResponse<FriendshipResponse> getFriendshipStatus(@RequestParam("userId") Long userId) {
        FriendshipResponse response = friendshipService.getFriendshipStatus(userId);
        return ApiResponse.<FriendshipResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }
}
