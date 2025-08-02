package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.PostRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.PostResponse;
import Social.Media.Backend.Application.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping
    ApiResponse<PostResponse> createPost(@RequestBody PostRequest request) {
        PostResponse response = postService.createPost(request);
        return ApiResponse.<PostResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping
    ApiResponse<List<PostResponse>> getPosts() {
        List<PostResponse> postResponseList = postService.getPosts();
        return ApiResponse.<List<PostResponse>>builder()
                .code(1000)
                .result(postResponseList)
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<List<PostResponse>> getPostsByUserId(@PathVariable("userId") Long userId) {
        List<PostResponse> postResponseList = postService.getPostsByUserId (userId);
        return ApiResponse.<List<PostResponse>>builder()
                .code(1000)
                .result(postResponseList)
                .build();
    }

    @GetMapping( "/user")
    ApiResponse<List<PostResponse>> getPostsByUser(){
        List<PostResponse> postResponseList = postService.getPostsByUser();
        return ApiResponse.<List<PostResponse>>builder()
                .code(1000)
                .result(postResponseList)
                .build();
    }

    @DeleteMapping("/{postId}")
    ApiResponse<Void> deletePost(@PathVariable Long postId){
        postService.deletePost(postId);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

    @PutMapping("/{postId}")
    ApiResponse<PostResponse> updatePost(@RequestBody PostRequest request, @PathVariable Long postId){
        PostResponse response = postService.updatePost(request, postId);
        return ApiResponse.<PostResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

}
