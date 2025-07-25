package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.ConversationRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.ConversationResponse;
import Social.Media.Backend.Application.service.ConversationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chat/conversations")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    ConversationService conversationService;

    @PostMapping("/create")
    ApiResponse<ConversationResponse> createConversation(@RequestBody @Valid ConversationRequest request) {
        ConversationResponse response = conversationService.create(request);
        return ApiResponse.<ConversationResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/my-conversations")
    ApiResponse<List<ConversationResponse>> myConversations() {
        List<ConversationResponse> conversationResponseList = conversationService.myConversations();
        return ApiResponse.<List<ConversationResponse>>builder()
                .result(conversationResponseList)
                .build();
    }
}
