package Social.Media.Backend.Application.controller;


import Social.Media.Backend.Application.dto.request.PostShareRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.PostShareResponse;
import Social.Media.Backend.Application.service.PostShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/post-share")
@RequiredArgsConstructor
public class PostShareController {

    private final PostShareService postShareService;

    @GetMapping
    ApiResponse<List<PostShareResponse>> postShare() {
        List<PostShareResponse> response = postShareService.getPostShares();
        return ApiResponse.<List<PostShareResponse>>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @PostMapping
    ApiResponse<PostShareResponse> createPostShare(@RequestBody PostShareRequest request) {
        PostShareResponse response = postShareService.createPostShare(request);
        return ApiResponse.<PostShareResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @DeleteMapping("/{postId}")
    ApiResponse<Void> deletePostShare(@PathVariable Long postId){
        postShareService.deletePostShare(postId);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<List<PostShareResponse>> getPostSharesByUserId(@PathVariable("userId") Long userId) {
        List<PostShareResponse> postShareResponseList = postShareService.getPostSharesByUserId(userId);
        return ApiResponse.<List<PostShareResponse>>builder()
                .code(1000)
                .result(postShareResponseList)
                .build();
    }

}
