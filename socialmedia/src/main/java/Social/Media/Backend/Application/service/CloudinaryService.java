package Social.Media.Backend.Application.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    String uploadCover(MultipartFile file);
    String uploadAvatar(MultipartFile file);
    String uploadPostImage(MultipartFile file);
    String extractPublicIdFromUrl(String imageUrl);
    void deleteImage(String imageUrl);
}
