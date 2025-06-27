package Social.Media.Backend.Application.dto.request;

import lombok.Data;

@Data
public class AuthenticationRequest {
    private String username;
    private String password;
    private String LoginMethod;
}
