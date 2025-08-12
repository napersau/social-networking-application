package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.IntrospectRequest;
import Social.Media.Backend.Application.entity.WebSocketSession;
import Social.Media.Backend.Application.service.AuthenticationService;
import Social.Media.Backend.Application.service.WebSocketSessionService;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.nimbusds.jose.JOSEException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.time.Instant;

@Slf4j
@RequiredArgsConstructor
@Component
public class SocketHandler {
    private final SocketIOServer server;
    private final AuthenticationService authenticationService;
    private final WebSocketSessionService webSocketSessionService;

    @OnConnect
    public void onConnect(SocketIOClient client) throws ParseException, JOSEException {
        // Get Token from request param
        String token = client.getHandshakeData().getSingleUrlParam("token");

        // Verify token
        var introspectResponse = authenticationService.introspect(IntrospectRequest.builder()
                .token(token)
                .build());

        // If Token is invalid disconnect
        if (introspectResponse.isValid()) {
            log.info("Client connected: {}", client.getSessionId());
            Long userId = introspectResponse.getUserId();
            // Persist webSocketSession
            WebSocketSession webSocketSession = WebSocketSession.builder()
                    .socketSessionId(client.getSessionId().toString())
                    .userId(introspectResponse.getUserId())
                    .createdAt(Instant.now())
                    .build();
            webSocketSession = webSocketSessionService.create(webSocketSession);

            server.getBroadcastOperations().sendEvent("user_online", userId);

            log.info("WebSocketSession created with id: {}", webSocketSession.getId());
        } else {
            log.error("Authentication fail: {}", client.getSessionId());
            client.disconnect();
        }
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        log.info("Client disConnected: {}", client.getSessionId());

        Long userId = webSocketSessionService.deleteSession(client.getSessionId().toString());

        // 🔹 Gửi thông báo user offline cho tất cả admin
        if (userId != null) {
            server.getBroadcastOperations().sendEvent("user_offline", userId);
        }
    }



    @PostConstruct
    public void startServer() {
        server.start();
        server.addListeners(this);
        log.info("Socket Server started");
    }

    @PreDestroy
    public void stopServer() {
        server.stop();
        log.info("Socket Server stopped");
    }
}
