package Social.Media.Backend.Application.dto.request;

import lombok.Data;

import java.time.Instant;

@Data
public class NotificationRequest {
    private Long userId;
    private Long senderId;
    private String title;
    private String content;
    private String actionUrl;
    private Instant createdAt;
    private Boolean isRead;
}
