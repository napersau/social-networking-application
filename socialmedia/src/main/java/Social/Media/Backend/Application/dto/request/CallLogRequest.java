package Social.Media.Backend.Application.dto.request;

import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.enums.CallStatus;
import Social.Media.Backend.Application.enums.CallType;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CallLogRequest {
    private Long callerId;
    private Long receiverId;
    private Long durationInSeconds;
    private CallStatus status;
    private CallType callType;
    private Long conversationId;
    private Instant startTime;
    private Instant endTime;
}
