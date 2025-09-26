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

    @PostMapping("/postShare")
    ApiResponse<LikeResponse> likePostShare(@RequestBody LikeRequest request) {
        LikeResponse response = likeService.likePostShare(request);
        return ApiResponse.<LikeResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping("/list/{postShareId}" )
    ApiResponse<List<LikeResponse>> getLikesByPostShareId(@PathVariable Long postShareId) {
        List<LikeResponse> response = likeService.getLikesByPostShareId(postShareId);
        return ApiResponse.<List<LikeResponse>>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping("/list/post/{postId}" )
    ApiResponse<List<LikeResponse>> getLikesByPostId(@PathVariable Long postId) {
        List<LikeResponse> response = likeService.getLikesByPostId(postId);
        return ApiResponse.<List<LikeResponse>>builder()
                .code(1000)
                .result(response)
                .build();
    }
}
