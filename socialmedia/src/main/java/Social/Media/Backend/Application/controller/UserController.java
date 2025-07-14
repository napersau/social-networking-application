package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.UserCreateRequest;
import Social.Media.Backend.Application.dto.request.UserSearch;
import Social.Media.Backend.Application.dto.request.UserUpdateRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.UserResponse;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreateRequest userCreateRequest) {
        UserResponse response = userService.createUser(userCreateRequest);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @PostMapping("/search")
    ApiResponse<List<UserResponse>> searchUsers(@RequestBody @Valid UserSearch userSearch) {
        List<UserResponse> response = userService.searchUsers(userSearch.getUsername());
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @PostMapping("/search-user")
    ApiResponse<List<UserResponse>> searchUsersByFullName(@RequestBody @Valid UserSearch userSearch) {
        List<UserResponse> response = userService.searchUsersByFullName(userSearch.getFullName());
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping
    ApiResponse<List<UserResponse>> getUsers() {
        List<UserResponse> response = userService.getUsers();
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .result(response)
                .build();
    }


    @PutMapping("/profile")
    ApiResponse<UserResponse> updateUser(@RequestBody @Valid UserUpdateRequest userUpdateRequest) {
        UserResponse response = userService.updateUser(userUpdateRequest);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @PutMapping("/password")
    ApiResponse<UserResponse> changePassword(@RequestBody @Valid UserUpdateRequest userUpdateRequest) {
        UserResponse response = userService.changePassword(userUpdateRequest);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        UserResponse response = userService.getMyInfo();
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUserById(@PathVariable("userId") Long userId) {
        UserResponse response = userService.getUserById (userId);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @PostMapping("/update/{userId}")
    ApiResponse<UserResponse> updateActiveUser(@PathVariable Long userId){
        UserResponse response = userService.updateActiveUser(userId);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }
}
