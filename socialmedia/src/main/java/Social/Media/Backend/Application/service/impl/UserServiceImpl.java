package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.UserCreateRequest;
import Social.Media.Backend.Application.dto.request.UserUpdateRequest;
import Social.Media.Backend.Application.dto.response.UserResponse;
import Social.Media.Backend.Application.entity.Role;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.RoleRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public UserResponse createUser(UserCreateRequest userCreateRequest) {
        if(userRepository.existsByUsername(userCreateRequest.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = modelMapper.map(userCreateRequest, User.class);
        user.setPassword(passwordEncoder.encode(userCreateRequest.getPassword()));
        user.setActive(true);
        user.setVerified(false);
        Role role = roleRepository.findById(2L).get();
        user.setRole(role);

        return modelMapper.map(userRepository.save(user), UserResponse.class);
    }

    @Override
    public List<UserResponse> getUsers() {
        return List.of();
    }

    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        return null;
    }

    @Override
    public UserResponse changePassword(Long id, String oldPassword, String newPassword) {
        return null;
    }

    @Override
    public UserResponse getMyProfile(Long id) {
        return null;
    }
}
