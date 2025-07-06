package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.ParticipantInfo;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    Long id;
    Long conversationId;
    boolean me;
    String message;
    ParticipantInfo sender;
    Instant createdDate;
    String clientId;
}
