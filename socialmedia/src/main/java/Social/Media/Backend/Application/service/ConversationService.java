package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.ConversationRequest;
import Social.Media.Backend.Application.dto.response.ConversationResponse;

import java.util.List;

public interface ConversationService {
    List<ConversationResponse> myConversations();
    ConversationResponse create(ConversationRequest request);
}
