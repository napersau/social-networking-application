package Social.Media.Backend.Application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageRequest {
    @NotNull(message = "conversationId must not be null")
    Long conversationId;

    @NotBlank(message = "message must not be blank")
    String message;

    private String clientId;
}
