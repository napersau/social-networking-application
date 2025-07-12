package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.ChatMessageResponse;
import Social.Media.Backend.Application.dto.response.NotificationResponse;
import Social.Media.Backend.Application.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    ApiResponse<List<NotificationResponse>> getNotifications (){
        List<NotificationResponse> notificationResponseList = notificationService.getNotifications();
        return ApiResponse.<List<NotificationResponse>>builder()
                .code(1000)
                .result(notificationResponseList)
                .build();
    }

}
