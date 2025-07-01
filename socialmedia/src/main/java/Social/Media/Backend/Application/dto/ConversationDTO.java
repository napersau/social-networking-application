package Social.Media.Backend.Application.dto;

import Social.Media.Backend.Application.dto.response.UserDTO;
import Social.Media.Backend.Application.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private String name;
    private Boolean isGroup;
    private Date createdAt;
    private Date updatedAt;
    private List<UserDTO> participants;
    private MessageDTO lastMessage;
    private Long unreadCount;
}
