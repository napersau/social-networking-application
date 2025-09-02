package Social.Media.Backend.Application.controller;


import Social.Media.Backend.Application.dto.request.CommentRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.CommentResponse;
import Social.Media.Backend.Application.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/create")
    ApiResponse<CommentResponse> createComment(@RequestBody CommentRequest request) {
        CommentResponse response = commentService.createComment(request);
        return ApiResponse.<CommentResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @PostMapping("/update/{id}")
    ApiResponse<CommentResponse> updateComment(@RequestBody CommentRequest request, @PathVariable Long id) {
        CommentResponse response = commentService.updateComment(request, id);

        return ApiResponse.<CommentResponse>builder()
                .code(1000)
                .result(response)
                .build();

    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ApiResponse.<String>builder()
                .code(1000)
                .result("Xóa bình luận thành công")
                .build();
    }

    @PostMapping("/reply")
    ApiResponse<CommentResponse> replyComment(@RequestBody CommentRequest request) {
        CommentResponse response = commentService.replyComment(request);
        return ApiResponse.<CommentResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping("/post/{postId}")
    ApiResponse<List<CommentResponse>> getCommentsByPostId(@PathVariable Long postId) {
        List<CommentResponse> response = commentService.getCommentsByPostId(postId);
        return ApiResponse.<List<CommentResponse>>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping("/postShare/{postShareId}")
    ApiResponse<List<CommentResponse>> getCommentsByPostShareId(@PathVariable Long postShareId) {
        List<CommentResponse> response = commentService.getCommentsByPostShareId(postShareId);
        return ApiResponse.<List<CommentResponse>>builder()
                .code(1000)
                .result(response)
                .build();
    }

}
