package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.dto.MessageDTO;
import Social.Media.Backend.Application.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String type; // MESSAGE, TYPING, ONLINE_STATUS
    private MessageDTO message;
    private String status;
    private Long userId;
}
