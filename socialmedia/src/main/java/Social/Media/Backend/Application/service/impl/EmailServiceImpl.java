package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.MailRequest;
import Social.Media.Backend.Application.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender emailSender;

    @Override
    @Async // Gửi bất đồng bộ
    public void sendSimpleMessage(MailRequest request) throws MessagingException {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("khoigptptit@gmail.com");
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());

            // HTML body
            String htmlContent = "<html><body>" +
                    "<h3>Xin chào!</h3>" +
                    "<p>" + request.getText() + "</p>" +
                    "<br><em>Đây là email tự động, vui lòng không trả lời lại.</em>" +
                    "</body></html>";
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (Exception e) {
            throw new MessagingException("Không thể gửi email: " + e.getMessage());
        }
    }
}
