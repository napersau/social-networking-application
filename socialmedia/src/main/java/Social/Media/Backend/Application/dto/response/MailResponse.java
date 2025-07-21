package Social.Media.Backend.Application.dto.response;

import lombok.Data;

@Data
public class MailResponse {
    private String to;
    private String subject;
    private String text;
}