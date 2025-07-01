package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.ConversationDTO;
import Social.Media.Backend.Application.dto.MessageDTO;
import Social.Media.Backend.Application.dto.request.ChatMessageRequest;
import Social.Media.Backend.Application.dto.response.UserDTO;
import Social.Media.Backend.Application.entity.Conversation;
import Social.Media.Backend.Application.entity.ConversationParticipant;
import Social.Media.Backend.Application.entity.Message;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.repository.ConversationParticipantRepository;
import Social.Media.Backend.Application.repository.ConversationRepository;
import Social.Media.Backend.Application.repository.MessageRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final UserRepository userRepository;

    @Override
    public MessageDTO sendMessage(Long senderId, ChatMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Conversation conversation;

        if (request.getConversationId() != null) {
            // Existing conversation
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        } else {
            // Create new conversation
            User recipient = userRepository.findById(request.getRecipientId())
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));

            conversation = createPrivateConversation(sender, recipient);
        }

        // Create message
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : "TEXT")
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        // Update conversation's updated_at
        conversation.setUpdatedAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        return convertToMessageDTO(message);
    }

    @Override
    public List<ConversationDTO> getUserConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findConversationsByUserId(userId);

        return conversations.stream()
                .map(conversation -> convertToConversationDTO(conversation, userId))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getConversationMessages(Long conversationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findMessagesByConversationId(conversationId, pageable);

        return messages.getContent().stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void markMessagesAsRead(Long conversationId, Long userId) {
        messageRepository.markMessagesAsRead(conversationId, userId);
    }

    @Override
    public List<UserDTO> getConversationParticipants(Long conversationId) {
        List<ConversationParticipant> participants = participantRepository.findByConversationId(conversationId);

        return participants.stream()
                .map(participant -> convertToUserDTO(participant.getUser()))
                .collect(Collectors.toList());
    }

    private Conversation createPrivateConversation(User user1, User user2) {
        // Check if conversation already exists
        Optional<Conversation> existingConversation =
                conversationRepository.findPrivateConversationBetweenUsers(user1.getId(), user2.getId());

        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }

        // Create new conversation
        Conversation conversation = Conversation.builder()
                .name(null) // Private conversation doesn't need name
                .isGroup(false)
                .build();

        conversation = conversationRepository.save(conversation);

        // Add participants
        ConversationParticipant participant1 = ConversationParticipant.builder()
                .conversation(conversation)
                .user(user1)
                .build();

        ConversationParticipant participant2 = ConversationParticipant.builder()
                .conversation(conversation)
                .user(user2)
                .build();

        participantRepository.save(participant1);
        participantRepository.save(participant2);

        return conversation;
    }

    private MessageDTO convertToMessageDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderUsername(message.getSender().getUsername())
                .senderAvatar(message.getSender().getAvatarUrl())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }

    private ConversationDTO convertToConversationDTO(Conversation conversation, Long currentUserId) {
        List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());

        // Get last message
        List<Message> messages = messageRepository.findMessagesByConversationIdOrderByCreatedAt(conversation.getId());
        MessageDTO lastMessage = null;
        if (!messages.isEmpty()) {
            lastMessage = convertToMessageDTO(messages.get(messages.size() - 1));
        }

        // Count unread messages
        long unreadCount = messageRepository.countUnreadMessages(conversation.getId(), currentUserId);

        // For private conversations, set name as other participant's name
        String conversationName = conversation.getName();
        if (!conversation.getIsGroup() && participants.size() == 2) {
            User otherUser = participants.stream()
                    .filter(p -> !p.getUser().getId().equals(currentUserId))
                    .findFirst()
                    .map(ConversationParticipant::getUser)
                    .orElse(null);

            if (otherUser != null) {
                conversationName = otherUser.getFirstName() + " " + otherUser.getLastName();
            }
        }

        return ConversationDTO.builder()
                .id(conversation.getId())
                .name(conversationName)
                .isGroup(conversation.getIsGroup())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .participants(participants.stream()
                        .map(p -> convertToUserDTO(p.getUser()))
                        .collect(Collectors.toList()))
                .lastMessage(lastMessage)
                .unreadCount(unreadCount)
                .build();
    }

    private UserDTO convertToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .build();
    }
}
