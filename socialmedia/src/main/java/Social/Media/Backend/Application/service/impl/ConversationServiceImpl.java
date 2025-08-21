package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.ConversationRequest;
import Social.Media.Backend.Application.dto.response.ConversationResponse;
import Social.Media.Backend.Application.entity.ChatMessage;
import Social.Media.Backend.Application.entity.Conversation;
import Social.Media.Backend.Application.entity.ParticipantInfo;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.ChatMessageRepository;
import Social.Media.Backend.Application.repository.ConversationRepository;
import Social.Media.Backend.Application.repository.ParticipantInfoRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.ConversationService;
import Social.Media.Backend.Application.utils.SecurityUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
@Slf4j
public class ConversationServiceImpl implements ConversationService {
    ConversationRepository conversationRepository;
    UserRepository userRepository;
    ChatMessageRepository chatMessageRepository;
    ModelMapper modelMapper;
    SecurityUtil securityUtil;

    @Override
    public List<ConversationResponse> myConversations() {
        User user = securityUtil.getCurrentUser();
        List<Conversation> conversations = conversationRepository.findAllByUserIdOrderByModifiedDateDesc(user.getId());
        return conversations.stream().map(this::toConversationResponse).toList();
    }

    @Override
    public ConversationResponse create(ConversationRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        User participant = userRepository.findById(request.getParticipantIds().get(0))
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        List<Long> userIds = List.of(currentUser.getId(), participant.getId());
        String participantsHash = generateParticipantHash(userIds);

        Conversation conversation = conversationRepository.findByParticipantsHash(participantsHash)
                .orElseGet(() -> {
                    Conversation newConv = createNewConversation(
                            request.getType(),
                            userIds,
                            List.of(currentUser, participant),
                            participantsHash
                    );
                    newConv.setName(participant.getLastName() + " " + participant.getFirstName());
                    newConv.setAvatarUrl(participant.getAvatarUrl());
                    return newConv;
                });

        return toConversationResponse(conversation);
    }

    @Override
    public ConversationResponse createGroupConversation(ConversationRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        List<User> participants = userRepository.findAllById(request.getParticipantIds());
        if (participants.isEmpty()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        List<Long> userIds = new ArrayList<>(request.getParticipantIds());
        userIds.add(currentUser.getId());
        String participantsHash = generateParticipantHash(userIds);

        List<User> allParticipants = new ArrayList<>(participants);
        allParticipants.add(currentUser);

        Conversation conversation = createNewConversation(
                request.getType(),
                userIds,
                allParticipants,
                participantsHash
        );
        conversation.setName(request.getName());
        conversation.setAvatarUrl(request.getAvatarUrl());


        return toConversationResponse(conversation);
    }

    @Override
    public ConversationResponse updateConversation(Long conversationId, ConversationRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        if (request.getName() != null) {
            conversation.setName(request.getName());
        }
        if (request.getAvatarUrl() != null) {
            conversation.setAvatarUrl(request.getAvatarUrl());
        }
        conversation.setModifiedDate(Instant.now());
        return toConversationResponse(conversation);
    }

    @Override
    public void deleteConversation(Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        conversationRepository.delete(conversation);
    }

    private Conversation createNewConversation(String type, List<Long> userIds, List<User> users, String participantsHash) {
        Conversation conversation = Conversation.builder()
                .type(type)
                .participantsHash(participantsHash)
                .createdDate(Instant.now())
                .modifiedDate(Instant.now())
                .build();

        List<ParticipantInfo> participantInfos = users.stream()
                .map(user -> ParticipantInfo.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .avatar(user.getAvatarUrl())
                        .conversation(conversation)
                        .build())
                .toList();

        conversation.setParticipants(participantInfos);
        return conversationRepository.save(conversation);
    }

    private String generateParticipantHash(List<Long> ids) {
        return ids.stream()
                .sorted()
                .map(String::valueOf)
                .collect(Collectors.joining("_"));
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        User user = securityUtil.getCurrentUser();
        ConversationResponse response = modelMapper.map(conversation, ConversationResponse.class);

        ChatMessage lastMsg = chatMessageRepository.findTopByConversation_IdOrderByCreatedDateDesc(conversation.getId());
        int unreadCount = chatMessageRepository.countUnreadMessages(conversation.getId(), user.getId());

        response.setUnread(unreadCount);
        response.setLastMessage(lastMsg != null ? lastMsg.getMessage() : null);
        return response;
    }
}
