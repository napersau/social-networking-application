package Social.Media.Backend.Application.dto.response;

import Social.Media.Backend.Application.entity.Role;
import lombok.Data;

import java.util.Date;

@Data
public class UserResponse {
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String coverUrl;
    private String bio;
    private Date birthDate;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private boolean isActive;
    private boolean isVerified;
    private Date lastLogin;
    private Role role;
}
