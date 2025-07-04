package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.ConversationRequest;
import Social.Media.Backend.Application.dto.response.ConversationResponse;
import Social.Media.Backend.Application.entity.Conversation;
import Social.Media.Backend.Application.entity.ParticipantInfo;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.ConversationRepository;
import Social.Media.Backend.Application.repository.ParticipantInfoRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.ConversationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.StringJoiner;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class ConversationServiceImpl implements ConversationService {
    ConversationRepository conversationRepository;
    UserRepository userRepository;
    ModelMapper modelMapper;
    ParticipantInfoRepository participantInfoRepository;

    @Override
    public List<ConversationResponse> myConversations() {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        List<Conversation> conversations = conversationRepository.findAllByParticipantIdsContains(user.getId());

        return conversations.stream().map(this::toConversationResponse).toList();
    }

    @Override
    public ConversationResponse create(ConversationRequest request) {
        // Fetch user infos
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Long userId = user.getId();
        User userInfo = userRepository.findById(userId).get();

        User participantInfo = userRepository.findById(request.getParticipantIds().get(0)).get();

        if (Objects.isNull(userInfo) || Objects.isNull(participantInfo)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }


        List<Long> userIds = new ArrayList<>();
        userIds.add(userId);
        userIds.add(participantInfo.getId());

        List<String> sortedIds = userIds.stream()
                .sorted()
                .map(String::valueOf)
                .collect(Collectors.toList());
        String userIdHash = generateParticipantHash(sortedIds);

        var conversation = conversationRepository.findByParticipantsHash(userIdHash)
                .orElseGet(() -> {
                    Conversation newConversation = Conversation.builder()
                            .type(request.getType())
                            .participantsHash(userIdHash)
                            .createdDate(Instant.now())
                            .modifiedDate(Instant.now())
                            .build();

                    List<ParticipantInfo> participantInfos = List.of(
                            ParticipantInfo.builder()
                                    .userId(userInfo.getId())
                                    .username(userInfo.getUsername())
                                    .firstName(userInfo.getFirstName())
                                    .lastName(userInfo.getLastName())
                                    .avatar(userInfo.getAvatarUrl())
                                    .conversation(newConversation)
                                    .build(),
                            ParticipantInfo.builder()
                                    .userId(participantInfo.getId())
                                    .username(participantInfo.getUsername())
                                    .firstName(participantInfo.getFirstName())
                                    .lastName(participantInfo.getLastName())
                                    .avatar(participantInfo.getAvatarUrl())
                                    .conversation(newConversation)
                                    .build()
                    );

                    newConversation.setParticipants(participantInfos);
                    Conversation conversationSaved = conversationRepository.save(newConversation);
                    return conversationSaved;
                });

        return toConversationResponse(conversation);
    }

    private String generateParticipantHash(List<String> ids) {
        StringJoiner stringJoiner = new StringJoiner("_");
        ids.forEach(stringJoiner::add);

        // SHA 256

        return stringJoiner.toString();
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ConversationResponse conversationResponse = modelMapper.map(conversation, ConversationResponse.class);

        conversation.getParticipants().stream()
                .filter(participantInfo -> !participantInfo.getUserId().equals(user.getId()))
                .findFirst().ifPresent(participantInfo -> {
                    conversationResponse.setConversationName(participantInfo.getUsername());
                    conversationResponse.setConversationAvatar(participantInfo.getAvatar());
                });

        return conversationResponse;
    }
}
