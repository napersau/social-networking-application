package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.ChatMessageRequest;
import Social.Media.Backend.Application.dto.response.ChatMessageResponse;
import Social.Media.Backend.Application.entity.ChatMessage;
import Social.Media.Backend.Application.entity.ParticipantInfo;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.entity.WebSocketSession;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.ChatMessageRepository;
import Social.Media.Backend.Application.repository.ConversationRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.repository.WebSocketSessionRepository;
import Social.Media.Backend.Application.service.ChatMessageService;
import com.corundumstudio.socketio.BroadcastOperations;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class ChatMessageServiceImpl implements ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ConversationRepository conversationRepository;
    private final WebSocketSessionRepository webSocketSessionRepository;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final SocketIOServer socketIOServer;
    private final ObjectMapper objectMapper;


    public List<ChatMessageResponse> getMessages(Long conversationId) {
        // Validate conversationId
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream()
                .filter(participantInfo -> user.getId().equals(participantInfo.getUserId()))
                .findAny()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var messages = chatMessageRepository.findAllByConversationIdOrderByCreatedDateDesc(conversationId);

        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    public ChatMessageResponse create(ChatMessageRequest request) {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        // Validate conversationId
        var conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        ParticipantInfo sender = conversation.getParticipants().stream()
                .filter(p -> p.getUserId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        ChatMessage chatMessage = ChatMessage.builder()
                .message(request.getMessage())
                .sender(sender)
                .createdDate(Instant.now())
                .conversation(conversation)
                .build();

        chatMessage = chatMessageRepository.save(chatMessage);

//        ChatMessageResponse chatMessageResponse = toChatMessageResponse(chatMessage);
//        chatMessageResponse.setClientId(request.getClientId()); // <-- THÊM DÒNG NÀY
//
//        socketIOServer.getRoomOperations(String.valueOf(request.getConversationId()))
//                .sendEvent("message", chatMessageResponse); // Gửi toàn bộ đối tượng response
//        return chatMessageResponse;


        // Publish socket event to clients is conversation
        // Get participants userIds;
        List<Long> userIds = conversation.getParticipants().stream()
                .map(ParticipantInfo::getUserId).toList();

        Map<String, WebSocketSession> webSocketSessions =
                webSocketSessionRepository
                        .findAllByUserIdIn(userIds).stream()
                        .collect(Collectors.toMap(
                                WebSocketSession::getSocketSessionId,
                                Function.identity()));

        ChatMessageResponse chatMessageResponse = modelMapper.map(chatMessage, ChatMessageResponse.class);
        socketIOServer.getAllClients().forEach(client -> {
            var webSocketSession = webSocketSessions.get(client.getSessionId().toString());

            if (Objects.nonNull(webSocketSession)) {
                String message = null;
                try {
                    chatMessageResponse.setMe(webSocketSession.getUserId().equals(user.getId()));
                    message = objectMapper.writeValueAsString(chatMessageResponse);
                    client.sendEvent("message", message);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        // convert to Response
        return toChatMessageResponse(chatMessage);

    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {

        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var chatMessageResponse = modelMapper.map(chatMessage, ChatMessageResponse.class);

        chatMessageResponse.setMe(user.getId().equals(chatMessage.getSender().getUserId()));

        return chatMessageResponse;
    }
}
