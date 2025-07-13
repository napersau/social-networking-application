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
        Notification notification = modelMapper.map(request, Notification.class);
        notification.setCreatedAt(Instant.now());
        notification.setIsRead(false);
        notificationRepository.save(notification);
        return modelMapper.map(notification, NotificationResponse.class) ;
    }

    @Override
    public NotificationResponse updateNotification(Long id) {
        return null;
    }
}
