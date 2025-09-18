package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.ReactionNotification;
import Social.Media.Backend.Application.dto.request.ChatMessageRequest;
import Social.Media.Backend.Application.dto.response.ChatMessageResponse;
import Social.Media.Backend.Application.dto.response.MediaResponse;
import Social.Media.Backend.Application.entity.*;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.*;
import Social.Media.Backend.Application.service.ChatMessageService;
import Social.Media.Backend.Application.utils.MediaUtil;
import Social.Media.Backend.Application.utils.SecurityUtil;
import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
    private final SocketIOServer socketIOServer;
    private final ObjectMapper objectMapper;
    private final MediaRepository mediaRepository;
    private final MediaUtil mediaUtil;
    private final SecurityUtil securityUtil;
    private final MessageReactionRepository messageReactionRepository;

    public List<ChatMessageResponse> getMessages(Long conversationId) {
        User user = securityUtil.getCurrentUser();

        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream()
                .filter(participantInfo -> user.getId().equals(participantInfo.getUserId()))
                .findAny()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var messages = chatMessageRepository.findAllByConversationIdOrderByCreatedDateAsc(conversationId);
        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    public ChatMessageResponse create(ChatMessageRequest request) {
        User user = securityUtil.getCurrentUser();
        var conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        ParticipantInfo sender = conversation.getParticipants().stream()
                .filter(p -> p.getUserId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        conversation.setModifiedDate(Instant.now());

        ChatMessage chatMessage = ChatMessage.builder()
                .message(request.getMessage())
                .sender(sender)
                .createdDate(Instant.now())
                .conversation(conversation)
                .isRead(false)
                .build();

        chatMessage = chatMessageRepository.save(chatMessage);

        mediaUtil.createMediaList(request.getMediaUrls(), chatMessage.getId(), "message");

        ChatMessageResponse chatMessageResponse = toChatMessageResponse(chatMessage);

        // Notify websocket event "message"
        notifyWebSocketEvent(chatMessageResponse, chatMessage.getConversation(), "message");

        return chatMessageResponse;
    }

    @Override
    public ChatMessageResponse recalledMessage(Long messageId) {
        ChatMessage chatMessage = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        chatMessage.setIsRecalled(true);
        ChatMessage saved = chatMessageRepository.save(chatMessage);

        ChatMessageResponse response = toChatMessageResponse(saved);

        // Notify websocket event "recalled"
        notifyWebSocketEvent(response, saved.getConversation(), "recalled");

        return response;
    }

    @Override
    public List<ChatMessageResponse> markMessagesAsRead(Long conversationId) {
        User user = securityUtil.getCurrentUser();

        List<ChatMessage> messages = chatMessageRepository
                .findAllByConversationIdAndSenderIdNotAndIsReadFalse(conversationId, user.getId());

        for (ChatMessage message : messages) {
            message.setIsRead(true);
        }

        chatMessageRepository.saveAll(messages);
        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    @Override
    public ChatMessageResponse reactToMessage(ChatMessageRequest request) {
        User user = securityUtil.getCurrentUser();

        ChatMessage chatMessage = chatMessageRepository.findById(request.getId())
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        MessageReaction messageReaction = messageReactionRepository
                .findByUserIdAndMessageId(user.getId(), chatMessage.getId())
                .orElseGet(() -> MessageReaction.builder()
                        .message(chatMessage)
                        .user(user)
                        .createdAt(Instant.now())
                        .build()
                );

        messageReaction.setReactionType(request.getReactionType());
        messageReactionRepository.save(messageReaction);

        // Tạo reaction notification
        ReactionNotification notification = ReactionNotification.builder()
                .messageId(chatMessage.getId())
                .userId(messageReaction.getUser().getId())
                .reactionType(messageReaction.getReactionType())
                .build();

        // Gửi socket event cho các client
        notifyWebSocketEvent(notification, chatMessage.getConversation(), "reaction");

        return toChatMessageResponse(chatMessage);
    }

    @Override
    public ChatMessageResponse updateMessage(ChatMessageRequest request, Long messageId) {
        ChatMessage chatMessage = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        chatMessage.setMessage(request.getMessage());
        chatMessage.setUpdatedDate(Instant.now());
        chatMessageRepository.save(chatMessage);

        ChatMessageResponse response = toChatMessageResponse(chatMessage);

        // Gửi socket event cho các client
        notifyWebSocketEvent(response, chatMessage.getConversation(), "messageUpdated");

        return response;
    }



    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        User user = securityUtil.getCurrentUser();

        var chatMessageResponse = modelMapper.map(chatMessage, ChatMessageResponse.class);
        chatMessageResponse.setMe(user.getId().equals(chatMessage.getSender().getUserId()));

        List<Media> mediaList = mediaRepository.findBySourceTypeAndSourceId("message", chatMessage.getId());
        List<MediaResponse> mediaResponses = mediaList.stream()
                .map(media -> modelMapper.map(media, MediaResponse.class))
                .toList();

        chatMessageResponse.setMediaList(mediaResponses);
        return chatMessageResponse;
    }

    /**
     * Generic method để gửi WebSocket notification cho tất cả participants trong conversation
     *
     * @param payload - Data cần gửi (có thể là ChatMessageResponse hoặc ReactionNotification)
     * @param conversation - Conversation chứa danh sách participants
     * @param eventName - Tên event ("message", "recalled", "reaction", v.v.)
     */
    private void notifyWebSocketEvent(Object payload, Conversation conversation, String eventName) {
        User currentUser = securityUtil.getCurrentUser();

        // Lấy danh sách userId của tất cả participants
        List<Long> participantUserIds = conversation.getParticipants().stream()
                .map(ParticipantInfo::getUserId)
                .toList();

        // Lấy tất cả WebSocket sessions của participants
        Map<String, WebSocketSession> webSocketSessions = webSocketSessionRepository
                .findAllByUserIdIn(participantUserIds)
                .stream()
                .collect(Collectors.toMap(
                        WebSocketSession::getSocketSessionId,
                        Function.identity()
                ));

        // Gửi event đến tất cả connected clients
        socketIOServer.getAllClients().forEach(client -> {
            WebSocketSession session = webSocketSessions.get(client.getSessionId().toString());

            if (session != null) {
                try {
                    Object finalPayload = payload;

                    // Đối với ChatMessageResponse, cần set thuộc tính "me" cho từng user
                    if (payload instanceof ChatMessageResponse chatResponse) {
                        // Clone response để tránh modify original object
                        ChatMessageResponse clonedResponse = modelMapper.map(chatResponse, ChatMessageResponse.class);
                        clonedResponse.setMe(session.getUserId().equals(currentUser.getId()));
                        clonedResponse.setMediaList(chatResponse.getMediaList());
                        finalPayload = clonedResponse;
                    }

                    String message = objectMapper.writeValueAsString(finalPayload);
                    client.sendEvent(eventName, message);

                } catch (JsonProcessingException e) {
                    // Log error instead of throwing runtime exception
                    System.err.println("Error serializing WebSocket message: " + e.getMessage());
                }
            }
        });
    }
}