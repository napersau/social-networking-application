package Social.Media.Backend.Application.dto.request;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
}
