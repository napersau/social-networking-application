package Social.Media.Backend.Application.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ReactionNotification {
    private Long messageId;
    private Long userId;
    private String reactionType;
}
