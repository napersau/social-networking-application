package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.TypingStatusDto;
import Social.Media.Backend.Application.service.TypingStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/typing")
@RequiredArgsConstructor
@Slf4j
public class TypingStatusController {
    
//    private final TypingStatusService typingStatusService;
//
//    @PostMapping("/update")
//    public ApiResponse<Void> updateTypingStatus(
//            @RequestParam Long conversationId,
//            @RequestParam Long userId,
//            @RequestParam Boolean isTyping) {
//
//        try {
//            typingStatusService.updateTypingStatus(conversationId, userId, isTyping);
//
//            return ApiResponse.<Void>builder()
//                    .code(1000)
//                    .message("Typing status updated successfully")
//                    .build();
//
//        } catch (Exception e) {
//            log.error("Error updating typing status", e);
//            return ApiResponse.<Void>builder()
//                    .code(1002)
//                    .message("Failed to update typing status: " + e.getMessage())
//                    .build();
//        }
//    }
//
//    @GetMapping("/users/{conversationId}")
//    public ApiResponse<List<TypingStatusDto>> getTypingUsers(
//            @PathVariable Long conversationId,
//            @RequestParam(required = false) Long excludeUserId) {
//
//        try {
//            List<TypingStatusDto> typingUsers = typingStatusService
//                    .getTypingUsers(conversationId, excludeUserId);
//
//            return ApiResponse.<List<TypingStatusDto>>builder()
//                    .code(1000)
//                    .message("Retrieved typing users successfully")
//                    .result(typingUsers)
//                    .build();
//
//        } catch (Exception e) {
//            log.error("Error getting typing users for conversation {}", conversationId, e);
//            return ApiResponse.<List<TypingStatusDto>>builder()
//                    .code(1002)
//                    .message("Failed to get typing users: " + e.getMessage())
//                    .build();
//        }
//    }
//
//    @DeleteMapping("/remove")
//    public ApiResponse<Void> removeTypingStatus(
//            @RequestParam Long conversationId,
//            @RequestParam Long userId) {
//
//        try {
//            typingStatusService.removeUserTypingStatus(conversationId, userId);
//
//            return ApiResponse.<Void>builder()
//                    .code(1000)
//                    .message("Typing status removed successfully")
//                    .build();
//
//        } catch (Exception e) {
//            log.error("Error removing typing status", e);
//            return ApiResponse.<Void>builder()
//                    .code(1002)
//                    .message("Failed to remove typing status: " + e.getMessage())
//                    .build();
//        }
//    }
}