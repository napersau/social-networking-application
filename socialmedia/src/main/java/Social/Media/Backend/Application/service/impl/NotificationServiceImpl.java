package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.NotificationRequest;
import Social.Media.Backend.Application.dto.response.NotificationResponse;
import Social.Media.Backend.Application.entity.Notification;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.NotificationRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.NotificationService;
import com.corundumstudio.socketio.SocketIOServer;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;


@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final SocketIOServer socketIOServer;

    @Override
    public List<NotificationResponse> getNotifications() {
        var context = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(context).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<Notification> notifications = notificationRepository.findAllByUserId(user.getId());
        return notifications.stream().map(notification -> modelMapper.map(notification, NotificationResponse.class)).toList();
    }

    @Override
    public NotificationResponse createNotification(NotificationRequest request) {
        User sender = userRepository.findById(request.getSenderId()).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        User user = userRepository.findById(request.getUserId()).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Notification notification = Notification.builder()
                .sender(sender)
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .createdAt(Instant.now())
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        NotificationResponse response = modelMapper.map(notification, NotificationResponse.class);

        socketIOServer.getRoomOperations(String.valueOf(user.getId()))
                .sendEvent("notification", response); // Tên sự kiện: "notification"

        return response ;
    }

    @Override
    public NotificationResponse updateNotification(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow(RuntimeException::new);
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return modelMapper.map(notification, NotificationResponse.class);
    }

    @Override
    public NotificationResponse deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow(RuntimeException::new);
        notificationRepository.delete(notification);
        return modelMapper.map(notification, NotificationResponse.class);
    }
}
