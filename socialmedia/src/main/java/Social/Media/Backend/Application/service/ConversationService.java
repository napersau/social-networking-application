package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.response.ConversationResponse;

public interface ConversationService {
    ConversationResponse createConversation(Long id);
}
