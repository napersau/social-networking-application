package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.request.UserCreateRequest;
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
//
//    @GetMapping
//    ApiResponse<List<UserResponse>> getUsers() {
//        return ApiResponse.<List<UserResponse>>builder()
//                .code(1000)
//                .result(userService.getUsers())
//                .build();
//    }
//
//
//    @PutMapping("/{userId}")
//    UserResponse updateUser(@PathVariable("userId") Long userId, @RequestBody @Valid UserUpdateRequest userUpdateRequest) {
//        return userService.updateUser(userId, userUpdateRequest);
//    }
//
//    @PutMapping("/password/{userId}")
//    ApiResponse<UserResponse> changePassword(@PathVariable("userId") Long userId, @RequestBody @Valid UserUpdateRequest userUpdateRequest) {
//        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
//        return ApiResponse.<UserResponse>builder()
//                .code(1000)
//                .result(userService.changePassword(userId, userUpdateRequest))
//                .build();
//    }
//
//    @GetMapping("/my-info")
//    ApiResponse<UserResponse> getMyInfo() {
//        return ApiResponse.<UserResponse>builder()
//                .code(1000)
//                .result(userService.getMyInfo())
//                .build();
//    }
}
