package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.*;
import Social.Media.Backend.Application.dto.request.ChatMessageRequest;
import Social.Media.Backend.Application.dto.response.ChatMessageResponse;
import Social.Media.Backend.Application.dto.response.UserDTO;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final MessageService messageService;
    private final UserRepository userRepository;

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload ChatMessageRequest chatMessage,
                            SimpMessageHeaderAccessor headerAccessor,
                            Principal principal) {
        try {
            // Get sender ID from authentication (you need to implement this based on your auth system)
            Long senderId = getCurrentUserId(principal);

            // Save message to database
            MessageDTO savedMessage = messageService.sendMessage(senderId, chatMessage);

            // Create response
            ChatMessageResponse response = ChatMessageResponse.builder()
                    .type("MESSAGE")
                    .message(savedMessage)
                    .build();

            // Send to conversation participants
            List<UserDTO> participants = messageService.getConversationParticipants(savedMessage.getConversationId());

            for (UserDTO participant : participants) {
                if (!participant.getId().equals(senderId)) {
                    messagingTemplate.convertAndSendToUser(
                            participant.getId().toString(),
                            "/queue/messages",
                            response
                    );
                }
            }

            // Send back to sender for confirmation
            messagingTemplate.convertAndSendToUser(
                    senderId.toString(),
                    "/queue/messages",
                    response
            );

        } catch (Exception e) {
            // Send error message back to sender
            ChatMessageResponse errorResponse = ChatMessageResponse.builder()
                    .type("ERROR")
                    .status("Failed to send message: " + e.getMessage())
                    .build();

            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/errors",
                    errorResponse
            );
        }
    }

    @MessageMapping("/addUser")
    public void addUser(@Payload ChatMessageRequest chatMessage,
                        SimpMessageHeaderAccessor headerAccessor,
                        Principal principal) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", principal.getName());

        ChatMessageResponse response = ChatMessageResponse.builder()
                .type("JOIN")
                .status("ONLINE")
                .userId(getCurrentUserId(principal))
                .build();

        messagingTemplate.convertAndSend("/topic/public", response);
    }

    @MessageMapping("/typing")
    public void typing(@Payload ChatMessageRequest chatMessage,
                       Principal principal) {
        Long senderId = getCurrentUserId(principal);

        ChatMessageResponse response = ChatMessageResponse.builder()
                .type("TYPING")
                .userId(senderId)
                .build();

        // Send typing indicator to conversation participants
        List<UserDTO> participants = messageService.getConversationParticipants(chatMessage.getConversationId());

        for (UserDTO participant : participants) {
            if (!participant.getId().equals(senderId)) {
                messagingTemplate.convertAndSendToUser(
                        participant.getId().toString(),
                        "/queue/typing",
                        response
                );
            }
        }
    }

    private Long getCurrentUserId(Principal principal) {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        // This is a placeholder - implement based on your authentication system
        // You might need to extract user ID from JWT token or session
        // For now, returning a dummy value
        return user.getId(); // Replace with actual implementation
    }
}
