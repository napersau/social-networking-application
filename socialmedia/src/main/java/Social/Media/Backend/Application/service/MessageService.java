package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.ConversationDTO;
import Social.Media.Backend.Application.dto.MessageDTO;
import Social.Media.Backend.Application.dto.request.ChatMessageRequest;
import Social.Media.Backend.Application.dto.response.UserDTO;

import java.util.List;

public interface MessageService {
    MessageDTO sendMessage(Long senderId, ChatMessageRequest request);
    List<ConversationDTO> getUserConversations(Long userId);
    List<MessageDTO> getConversationMessages(Long conversationId, int page, int size);
    void markMessagesAsRead(Long conversationId, Long userId);
    List<UserDTO> getConversationParticipants(Long conversationId);
}
