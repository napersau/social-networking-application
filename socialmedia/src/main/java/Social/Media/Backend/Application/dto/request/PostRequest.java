package Social.Media.Backend.Application.dto.request;

import lombok.Data;

@Data
public class PostRequest {
    private String content;
    private String imageUrl;
    private String videoUrl;
    private String location;
    private String privacy;
}
