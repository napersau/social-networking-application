package Social.Media.Backend.Application.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ConversationResponse {
    private Long id;
    private String name;
    private LocalDateTime updatedAt;
    private List<UserResponse> participants;
    private ChatMessageResponse lastMessage;
    private int unreadCount;
}
