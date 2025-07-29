package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.ChatMessageRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.ChatMessageResponse;
import Social.Media.Backend.Application.service.ChatMessageService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chat/messages")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageController {
    ChatMessageService chatMessageService;

    @PostMapping("/create")
    ApiResponse<ChatMessageResponse> create(
            @RequestBody @Valid ChatMessageRequest request) {
        ChatMessageResponse response = chatMessageService.create(request);
        return ApiResponse.<ChatMessageResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping
    ApiResponse<List<ChatMessageResponse>> getMessages(
            @RequestParam("conversationId") Long conversationId) {
        List<ChatMessageResponse> response = chatMessageService.getMessages(conversationId);
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(response)
                .build();
    }

    @PostMapping("/{messageId}")
    ApiResponse<ChatMessageResponse> recalledMessage(@PathVariable Long messageId){
        ChatMessageResponse response = chatMessageService.recalledMessage(messageId);
        return ApiResponse.<ChatMessageResponse>builder()
                .result(response)
                .build();
    }
}
