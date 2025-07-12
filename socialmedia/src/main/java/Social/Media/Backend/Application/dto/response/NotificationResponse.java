package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.User;
import lombok.Data;

import java.time.Instant;

@Data
public class NotificationResponse {
    private Long id;
    private User userId;
    private User senderId;
    private String title;
    private String content;
    private String actionUrl;
    private Instant createdAt;
    private Boolean isRead;
}
