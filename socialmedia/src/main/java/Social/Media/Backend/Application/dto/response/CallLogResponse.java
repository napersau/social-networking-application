package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.enums.CallStatus;
import Social.Media.Backend.Application.enums.CallType;
import lombok.Data;

import java.time.Instant;

@Data
public class CallLogResponse {
    private Long id;
    private UserResponse caller;
    private UserResponse receiver;
    private Instant startTime;
    private Instant endTime;
    private Long durationInSeconds;
    private CallStatus status;
    private CallType callType;
    private ConversationResponse conversation;
}
