package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.LikeRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.LikeResponse;
import Social.Media.Backend.Application.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    ApiResponse<LikeResponse> likePost(@RequestBody LikeRequest request) {
        LikeResponse response = likeService.likePost(request);
        return ApiResponse.<LikeResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @PostMapping("/comment")
    ApiResponse<LikeResponse> likeComment(@RequestBody LikeRequest request) {
        LikeResponse response = likeService.likeComment(request);
        return ApiResponse.<LikeResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping("/{postId}")
    ApiResponse<List<LikeResponse>> getUsersLikedPost(@PathVariable Long postId) {
//        LikeResponse response = likeService.likeComment(request);
//        return ApiResponse.<LikeResponse>builder()
//                .code(1000)
//                .result(response)
//                .build();
        return null;
    }
}
