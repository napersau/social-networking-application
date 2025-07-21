package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.MailRequest;
import jakarta.mail.MessagingException;

public interface EmailService {
    void sendSimpleMessage(MailRequest request) throws MessagingException;
}
