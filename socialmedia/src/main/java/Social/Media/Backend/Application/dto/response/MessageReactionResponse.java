package Social.Media.Backend.Application.dto.response;

import lombok.Data;

import java.time.Instant;

@Data
public class MessageReactionResponse {
    private Long id;
    private Long messageId;
    private String reactionType;
    private Long userId;
    private Instant createdAt;
}
