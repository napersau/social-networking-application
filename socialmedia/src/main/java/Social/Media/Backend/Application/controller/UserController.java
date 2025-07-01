package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.UserCreateRequest;
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
        UserResponse user = userService.createUser(userCreateRequest);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(user)
                .build();
    }

    @GetMapping
    ApiResponse<List<UserResponse>> getUsers() {
        List<UserResponse> users = userService.getUsers();
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .result(users)
                .build();
    }


    @PutMapping("/profile")
    ApiResponse<UserResponse> updateUser(@RequestBody @Valid UserUpdateRequest userUpdateRequest) {
        UserResponse user = userService.updateUser(userUpdateRequest);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(user)
                .build();
    }

    @PutMapping("/password")
    ApiResponse<UserResponse> changePassword(@RequestBody @Valid UserUpdateRequest userUpdateRequest) {
        UserResponse user = userService.changePassword(userUpdateRequest);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(user)
                .build();
    }

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        UserResponse user = userService.getMyInfo();
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(user)
                .build();
    }
}
