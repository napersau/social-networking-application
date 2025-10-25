package Social.Media.Backend.Application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageRequest {
    Long id;
    @NotNull(message = "conversationId must not be null")
    Long conversationId;
    @NotBlank(message = "message must not be blank")
    String message;
    private String clientId;
    private List<String> mediaUrls;
    private String reactionType;


}
