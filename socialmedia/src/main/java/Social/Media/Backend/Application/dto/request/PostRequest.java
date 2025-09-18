package Social.Media.Backend.Application.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class PostRequest {
    private String content;
    private String imageUrl;
    private String videoUrl;
    private String location;
    private String privacy;
    private List<String> mediaUrls;
    private List<String> mediaTypes;
}
