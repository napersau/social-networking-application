package Social.Media.Backend.Application.controller;


import Social.Media.Backend.Application.dto.request.CommentRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.CommentResponse;
import Social.Media.Backend.Application.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/update")
    public void updateComment() {

    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ApiResponse.<String>builder()
                .code(1000)
                .result("Xóa bình luận thành công")
                .build();
    }
}
