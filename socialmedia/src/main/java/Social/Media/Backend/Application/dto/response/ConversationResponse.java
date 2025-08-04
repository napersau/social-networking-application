package Social.Media.Backend.Application.dto.response;


import Social.Media.Backend.Application.entity.ParticipantInfo;
import lombok.*;
import lombok.experimental.FieldDefaults;


import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationResponse {
    Long id;
    String type; // GROUP, DIRECT
    String participantsHash;
    String conversationAvatar;
    String conversationName;
    List<ParticipantInfo> participants;
    Instant createdDate;
    Instant modifiedDate;
    Integer unread;
    String lastMessage;
}
