package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotifications();
}
