package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.config.SocketIOConfig;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class SocketHandler {
    private final SocketIOServer server;

    @OnConnect
    public void onConnect(SocketIOClient client) {
        log.info("Client connected: {}", client.getSessionId());
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        log.info("Client disconnected: {}", client.getSessionId());
    }

    @OnEvent("join-conversation")
    public void onJoinConversation(SocketIOClient client, Long conversationId) {
        // Tham gia client vào một phòng có tên là conversationId
        client.joinRoom(String.valueOf(conversationId));
        log.info("Client {} joined room {}", client.getSessionId(), conversationId);
    }

    // --- THÊM LISTENER CHO SỰ KIỆN "leave-conversation" ---
    @OnEvent("leave-conversation")
    public void onLeaveConversation(SocketIOClient client, Long conversationId) {
        // Rời client khỏi phòng có tên là conversationId
        client.leaveRoom(String.valueOf(conversationId));
        log.info("Client {} left room {}", client.getSessionId(), conversationId);
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
