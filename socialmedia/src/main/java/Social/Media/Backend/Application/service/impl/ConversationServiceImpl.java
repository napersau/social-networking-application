package Social.Media.Backend.Application.service.impl;


import Social.Media.Backend.Application.dto.response.ConversationResponse;
import Social.Media.Backend.Application.entity.Conversation;
import Social.Media.Backend.Application.entity.ConversationParticipant;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.repository.ConversationRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final ModelMapper modelMapper;

    @Override
    public ConversationResponse createConversation(Long userId) {
        // 1. Tạo một conversation mới
        Conversation conversation = Conversation.builder()
                .isGroup(false)
                .name(null) // có thể tự đặt tên nếu muốn, ví dụ: "Direct Message"
                .build();

        // 2. Tạo participant
        ConversationParticipant participant = ConversationParticipant.builder()
                .user(User.builder().id(userId).build()) // hoặc findById nếu cần
                .conversation(conversation)
                .build();

        conversation.setParticipants(List.of(participant));

        // 3. Lưu vào database
        Conversation savedConversation = conversationRepository.save(conversation);

        // 4. Chuyển sang DTO để trả về
        return modelMapper.map(savedConversation, ConversationResponse.class);
    }
}
