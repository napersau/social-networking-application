package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.CreateConversationRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.ConversationResponse;
import Social.Media.Backend.Application.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    public ApiResponse<ConversationResponse> createConversation(@RequestBody @Valid CreateConversationRequest request) {
        ConversationResponse conversation = conversationService.createConversation(request.getUserId());
        return ApiResponse.<ConversationResponse>builder()
                .code(1000)
                .result(conversation)
                .build();
    }
}