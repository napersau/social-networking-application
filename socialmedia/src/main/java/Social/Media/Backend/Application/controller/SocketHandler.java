package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.CallLogRequest;
import Social.Media.Backend.Application.dto.request.IntrospectRequest;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.entity.WebSocketSession;
import Social.Media.Backend.Application.enums.CallStatus;
import Social.Media.Backend.Application.enums.CallType;
import Social.Media.Backend.Application.service.AuthenticationService;
import Social.Media.Backend.Application.service.CallLogService;
import Social.Media.Backend.Application.service.UserService;
import Social.Media.Backend.Application.service.WebSocketSessionService;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.nimbusds.jose.JOSEException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Component
public class SocketHandler {
    private final SocketIOServer server;
    private final AuthenticationService authenticationService;
    private final WebSocketSessionService webSocketSessionService;
    private final CallLogService callLogService;
    private final UserService userService;
    private final ModelMapper modelMapper;

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


    // 🔹 ----- BỔ SUNG CÁC HÀM XỬ LÝ CUỘC GỌI ----- 🔹

    @OnEvent("invite-call")
    public void onInviteCall(SocketIOClient client, Map<String, Object> data) {
        try {
            log.info("📞 Received invite-call event: {}", data);

            Long targetUserId = ((Number) data.get("targetUserId")).longValue();
            String callTypeStr = (String) data.get("callType");
            CallType callType = CallType.valueOf(callTypeStr);

            Long callerId = webSocketSessionService.getUserIdBySessionId(client.getSessionId().toString());
            if (callerId == null) {
                log.warn("Invite-call: Cannot find user for session {}", client.getSessionId());
                return;
            }

            log.info("📞 Caller ID: {}, Target ID: {}", callerId, targetUserId);

            // 1. TẠO LOG CUỘC GỌI
            CallLogRequest createRequest = CallLogRequest.builder()
                    .callerId(callerId)
                    .receiverId(targetUserId)
                    .conversationId(((Number) data.get("conversationId")).longValue())
                    .callType(callType)
                    .status(CallStatus.RINGING)
                    .startTime(Instant.now())
                    .build();

            var newLog = callLogService.createCallLog(createRequest);
            Long callLogId = newLog.getId();

            log.info("📞 Created call log ID: {}", callLogId);

            // 2. GỬI LỜI MỜI CHO NGƯỜI NHẬN
            String targetSessionId = webSocketSessionService.getSessionIdForUser(targetUserId);
            log.info("📞 Target session ID: {}", targetSessionId);

            if (targetSessionId != null) {
                SocketIOClient targetClient = server.getClient(UUID.fromString(targetSessionId));
                if (targetClient != null) {
                    log.info("📞 Target client found, fetching caller info...");

                    // Lấy thông tin người gọi
                    var callerUserResponse = userService.getUserById(callerId);
                    if (callerUserResponse == null) {
                        log.error("❌ Caller user not found: {}", callerId);
                        return;
                    }

                    User callerUser = modelMapper.map(callerUserResponse, User.class);

                    Map<String, Object> payload = Map.of(
                            "callLogId", callLogId,
                            "callerId", callerId,
                            "callerName", callerUser.getFirstName() + " " + callerUser.getLastName(),
                            "callerAvatar", callerUser.getAvatarUrl() != null ? callerUser.getAvatarUrl() : "",
                            "callType", callTypeStr
                    );

                    log.info("📤 Sending incoming-call to target: {}", payload);
                    targetClient.sendEvent("incoming-call", payload);
                    log.info("✅ incoming-call sent successfully");
                } else {
                    log.warn("❌ Target client not found for session: {}", targetSessionId);
                }
            } else {
                log.warn("❌ Target user {} is not online", targetUserId);
            }
        } catch (Exception e) {
            log.error("❌ Error in invite-call handler", e);
        }
    }

    @OnEvent("accept-call")
    public void onAcceptCall(SocketIOClient client, Map<String, Object> data) {
        Long targetUserId = ((Number) data.get("targetUserId")).longValue(); // Đây là người gọi (A)

        // 1. (Tùy chọn) Cập nhật trạng thái log
        // Long callLogId = ((Number) data.get("callLogId")).longValue();
        // callLogService.updateCallLogStatus(callLogId, CallStatus.IN_PROGRESS);

        // 2. Báo cho người gọi (A) biết là cuộc gọi đã được chấp nhận
        String targetSessionId = webSocketSessionService.getSessionIdForUser(targetUserId);
        if (targetSessionId != null) {
            SocketIOClient targetClient = server.getClient(UUID.fromString(targetSessionId));
            if (targetClient != null) {
                targetClient.sendEvent("call-accepted");
            }
        }
    }

    @OnEvent("webrtc-signal")
    public void onWebRTCSignal(SocketIOClient client, Map<String, Object> data) {
        Long targetUserId = ((Number) data.get("targetUserId")).longValue();
        Object payload = data.get("payload"); // offer, answer, or candidate

        String targetSessionId = webSocketSessionService.getSessionIdForUser(targetUserId);
        if (targetSessionId != null) {
            SocketIOClient targetClient = server.getClient(UUID.fromString(targetSessionId));
            if (targetClient != null) {
                // Chuyển tiếp tín hiệu WebRTC
                targetClient.sendEvent("webrtc-signal", payload);
            }
        }
    }

    @OnEvent("decline-call")
    public void onDeclineCall(SocketIOClient client, Map<String, Object> data) {
        Long callLogId = ((Number) data.get("callLogId")).longValue();
        Long targetUserId = ((Number) data.get("targetUserId")).longValue(); // Người gọi (A)

        // 1. CẬP NHẬT LOG
        CallLogRequest updateRequest = CallLogRequest.builder()
                .status(CallStatus.DECLINED)
                .endTime(Instant.now())
                .durationInSeconds(0L)
                .build();
        callLogService.updateCallLog(updateRequest, callLogId);

        // 2. BÁO CHO NGƯỜI GỌI (A)
        String targetSessionId = webSocketSessionService.getSessionIdForUser(targetUserId);
        if (targetSessionId != null) {
            SocketIOClient targetClient = server.getClient(UUID.fromString(targetSessionId));
            if (targetClient != null) {
                targetClient.sendEvent("call-declined");
            }
        }
    }

    @OnEvent("hang-up")
    public void onHangUp(SocketIOClient client, Map<String, Object> data) {
        Long callLogId = ((Number) data.get("callLogId")).longValue();
        Long targetUserId = ((Number) data.get("targetUserId")).longValue(); // Người bên kia
        CallStatus finalStatus = CallStatus.valueOf((String) data.get("status")); // COMPLETED hoặc MISSED
        Long duration = ((Number) data.get("duration")).longValue();

        // 1. CẬP NHẬT LOG
        CallLogRequest updateRequest = CallLogRequest.builder()
                .status(finalStatus)
                .endTime(Instant.now())
                .durationInSeconds(duration)
                .build();
        callLogService.updateCallLog(updateRequest, callLogId);

        // 2. BÁO CHO NGƯỜI BÊN KIA
        String targetSessionId = webSocketSessionService.getSessionIdForUser(targetUserId);
        if (targetSessionId != null) {
            SocketIOClient targetClient = server.getClient(UUID.fromString(targetSessionId));
            if (targetClient != null) {
                targetClient.sendEvent("call-ended");
            }
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
