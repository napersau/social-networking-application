package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.ConversationDTO;
import Social.Media.Backend.Application.dto.MessageDTO;
import Social.Media.Backend.Application.dto.response.UserDTO;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            List<ConversationDTO> conversations = messageService.getUserConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            List<MessageDTO> messages = messageService.getConversationMessages(conversationId, page, size);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/conversations/{conversationId}/participants")
    public ResponseEntity<List<UserDTO>> getConversationParticipants(
            @PathVariable Long conversationId,
            Principal principal) {
        try {
            List<UserDTO> participants = messageService.getConversationParticipants(conversationId);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long conversationId,
            Principal principal) {
        try {
            Long userId = getCurrentUserId(principal);
            messageService.markMessagesAsRead(conversationId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private Long getCurrentUserId(Principal principal) {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return user.getId();
    }
}
