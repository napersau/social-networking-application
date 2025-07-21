package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.ForgotPasswordRequest;

public interface PasswordResetService {
    void sendPasswordResetOtp(ForgotPasswordRequest request);
    boolean verifyOtp(ForgotPasswordRequest request);
    void resetPassword(ForgotPasswordRequest request);
}
