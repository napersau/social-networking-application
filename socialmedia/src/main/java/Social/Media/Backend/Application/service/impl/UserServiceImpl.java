package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.GoogleAccountRequest;
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
import Social.Media.Backend.Application.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final SecurityUtil securityUtil;
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
        user.setIsActive(true);
        user.setIsVerified(false);
        Role role = roleRepository.findById(2L).get();
        user.setRole(role);

        return modelMapper.map(userRepository.save(user), UserResponse.class);
    }

    @Override
    public List<UserResponse> getUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> userResponses = new ArrayList<>();
        users.forEach(user -> userResponses.add(modelMapper.map(user, UserResponse.class)));
        return userResponses;
    }

    @Override
    public UserResponse updateUser(UserUpdateRequest request) {

        User user = securityUtil.getCurrentUser();

        user.setBio(request.getBio());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setAddress(request.getAddress());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setBirthDate(request.getBirthDate());
        user.setGender(request.getGender());
        user.setCoverUrl(request.getCoverUrl());
        user.setGoogleAccountId(0L);
        userRepository.save(user);
        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public UserResponse changePassword(UserUpdateRequest request) {
        User user = securityUtil.getCurrentUser();

        boolean authenticated =  passwordEncoder.matches(request.getOldPassword(), user.getPassword());
        if(!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        else{
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        userRepository.save(user);
        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public UserResponse getMyInfo() {
        User user = securityUtil.getCurrentUser();

        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public List<UserResponse> searchUsers(String username) {

        User me = securityUtil.getCurrentUser();

        List<User> users = userRepository.findByUsernameContaining(username);
        List<UserResponse> userResponses = new ArrayList<>();
        users.stream()
                .filter(user -> !user.getId().equals(me.getId()))
                .forEach(user -> userResponses.add(modelMapper.map(user, UserResponse.class)));
        return userResponses;
    }

    @Override
    public List<UserResponse> searchUsersByFullName(String fullName) {
        List<User> users = userRepository.searchByFullName(fullName);
        List<UserResponse> userResponses = new ArrayList<>();
        users.forEach(user -> userResponses.add(modelMapper.map(user, UserResponse.class)));
        return userResponses;
    }

    @Override
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public UserResponse updateActiveUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()
                -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setIsActive(!user.getIsActive());
        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public UserResponse createByGoogleAccount(GoogleAccountRequest googleAccountDTO) {
        Optional<User> existingUser = userRepository.findByUsername(googleAccountDTO.getEmail());

        if (existingUser.isPresent()) {
            return modelMapper.map(existingUser.get(), UserResponse.class);
        }

        Role role = roleRepository.findById(2L).orElseThrow(() -> new RuntimeException("Role Not Found"));

        User user = new User();
        user.setUsername(googleAccountDTO.getEmail());
        user.setPassword(passwordEncoder.encode(googleAccountDTO.getEmail()));
        user.setFirstName(googleAccountDTO.getName());
        user.setEmail(googleAccountDTO.getEmail());
        user.setAvatarUrl(googleAccountDTO.getPicture());
        user.setCreatedAt(googleAccountDTO.getExp());
        user.setRole(role);
        user.setIsActive(true);
        user.setGoogleAccountId(1L);
        User savedUser = userRepository.save(user);

        return modelMapper.map(savedUser, UserResponse.class);
    }
}
