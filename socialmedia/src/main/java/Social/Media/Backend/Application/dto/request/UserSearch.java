package Social.Media.Backend.Application.dto.request;

import lombok.Data;

@Data
public class UserSearch {
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;

}
