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
                .code(1000)
                .build();
    }

    @GetMapping
    ApiResponse<List<ChatMessageResponse>> getMessages(
            @RequestParam("conversationId") Long conversationId) {
        List<ChatMessageResponse> response = chatMessageService.getMessages(conversationId);
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(response)
                .code(1000)
                .build();
    }

    @PostMapping("/{messageId}")
    ApiResponse<ChatMessageResponse> recalledMessage(@PathVariable Long messageId){
        ChatMessageResponse response = chatMessageService.recalledMessage(messageId);
        return ApiResponse.<ChatMessageResponse>builder()
                .result(response)
                .code(1000)
                .build();
    }

    @PutMapping("/read")
    ApiResponse<List<ChatMessageResponse>> markMessagesAsRead(@RequestParam Long conversationId){
        List<ChatMessageResponse> response = chatMessageService.markMessagesAsRead(conversationId);
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(response)
                .code(1000)
                .build();
    }

    @PutMapping("/react")
    ApiResponse<ChatMessageResponse> reactToMessage(@RequestBody ChatMessageRequest request){
        ChatMessageResponse response = chatMessageService.reactToMessage(request);
        return ApiResponse.<ChatMessageResponse>builder()
                .result(response)
                .code(1000)
                .build();
    }

    @PutMapping("/{messageId}")
    ApiResponse<ChatMessageResponse> updateMessage(@RequestBody ChatMessageRequest request, @PathVariable Long messageId){
        ChatMessageResponse response = chatMessageService.updateMessage(request, messageId);
        return ApiResponse.<ChatMessageResponse>builder()
                .result(response)
                .code(1000)
                .build();
    }
}
