package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.ChatMessageRequest;
import Social.Media.Backend.Application.dto.response.ChatMessageResponse;

import java.util.List;

public interface ChatMessageService {
    List<ChatMessageResponse> getMessages(Long conversationId);
    ChatMessageResponse create(ChatMessageRequest request);
    ChatMessageResponse recalledMessage(Long messageId);
}
