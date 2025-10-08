package Social.Media.Backend.Application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingStatusDto {
    private Long userId;
    private String username;
    private String avatarUrl;
    private Boolean isTyping;
    private LocalDateTime lastUpdated;
}