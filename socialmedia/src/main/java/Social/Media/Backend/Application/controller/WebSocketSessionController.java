package Social.Media.Backend.Application.controller;


import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.service.WebSocketSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/websocket-session")
@RequiredArgsConstructor
public class WebSocketSessionController {

    private final WebSocketSessionService webSocketSessionService;

    @GetMapping("/user-online")
    ApiResponse<List<Long>> getOnlineUsers() {
        List<Long> response = webSocketSessionService.getOnlineUsers();
        return ApiResponse.<List<Long>>builder()
                .code(1000)
                .result(response)
                .build();
    }
}
