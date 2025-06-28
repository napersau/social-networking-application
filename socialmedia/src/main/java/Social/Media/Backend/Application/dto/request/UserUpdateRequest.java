package Social.Media.Backend.Application.dto.request;

import lombok.Data;

import java.util.Date;

@Data
public class UserUpdateRequest {
    private String oldPassword;
    private String newPassword;
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
}
