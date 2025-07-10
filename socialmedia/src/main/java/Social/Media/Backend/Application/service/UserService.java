package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.UserCreateRequest;
import Social.Media.Backend.Application.dto.request.UserUpdateRequest;
import Social.Media.Backend.Application.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserCreateRequest request) ;
    List<UserResponse> getUsers();
    UserResponse updateUser(UserUpdateRequest request);
    UserResponse changePassword(UserUpdateRequest request);
    UserResponse getMyInfo();
    List<UserResponse> searchUsers(String username);
    List<UserResponse> searchUsersByFullName(String fullName);
    UserResponse getUserById(Long userId);
}
