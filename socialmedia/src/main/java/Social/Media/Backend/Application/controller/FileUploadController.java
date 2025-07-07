package Social.Media.Backend.Application.controller;

import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.FileUploadResponse;
import Social.Media.Backend.Application.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileUploadResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Uploading avatar file: {}, size: {}", file.getOriginalFilename(), file.getSize());

            String imageUrl = cloudinaryService.uploadAvatar(file);

            FileUploadResponse response = FileUploadResponse.builder()
                    .url(imageUrl)
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .build();

            return ApiResponse.<FileUploadResponse>builder()
                    .code(1000)
                    .message("Avatar uploaded successfully")
                    .result(response)
                    .build();

        } catch (IllegalArgumentException e) {
            log.error("Invalid avatar file: {}", e.getMessage());
            return ApiResponse.<FileUploadResponse>builder()
                    .code(1001)
                    .message(e.getMessage())
                    .build();

        } catch (Exception e) {
            log.error("Failed to upload avatar", e);
            return ApiResponse.<FileUploadResponse>builder()
                    .code(1002)
                    .message("Upload failed: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping(value = "/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileUploadResponse> uploadCover(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Uploading cover file: {}, size: {}", file.getOriginalFilename(), file.getSize());

            String imageUrl = cloudinaryService.uploadCover(file);

            FileUploadResponse response = FileUploadResponse.builder()
                    .url(imageUrl)
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .build();

            return ApiResponse.<FileUploadResponse>builder()
                    .code(1000)
                    .message("Cover uploaded successfully")
                    .result(response)
                    .build();

        } catch (IllegalArgumentException e) {
            log.error("Invalid cover file: {}", e.getMessage());
            return ApiResponse.<FileUploadResponse>builder()
                    .code(1001)
                    .message(e.getMessage())
                    .build();

        } catch (Exception e) {
            log.error("Failed to upload cover", e);
            return ApiResponse.<FileUploadResponse>builder()
                    .code(1002)
                    .message("Upload failed: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping(value = "/post-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileUploadResponse> uploadPostImage(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Uploading post image file: {}, size: {}", file.getOriginalFilename(), file.getSize());

            String imageUrl = cloudinaryService.uploadPostImage(file);

            FileUploadResponse response = FileUploadResponse.builder()
                    .url(imageUrl)
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .build();

            return ApiResponse.<FileUploadResponse>builder()
                    .code(1000)
                    .message("Post image uploaded successfully")
                    .result(response)
                    .build();

        } catch (IllegalArgumentException e) {
            log.error("Invalid post image file: {}", e.getMessage());
            return ApiResponse.<FileUploadResponse>builder()
                    .code(1001)
                    .message(e.getMessage())
                    .build();

        } catch (Exception e) {
            log.error("Failed to upload post image", e);
            return ApiResponse.<FileUploadResponse>builder()
                    .code(1002)
                    .message("Upload failed: " + e.getMessage())
                    .build();
        }
    }

    @DeleteMapping("/delete")
    public ApiResponse<Void> deleteImage(@RequestParam("imageUrl") String imageUrl) {
        try {
            log.info("Deleting image: {}", imageUrl);
            cloudinaryService.deleteImage(imageUrl);

            return ApiResponse.<Void>builder()
                    .code(1000)
                    .message("Image deleted successfully")
                    .build();

        } catch (Exception e) {
            log.error("Failed to delete image: {}", imageUrl, e);
            return ApiResponse.<Void>builder()
                    .code(1002)
                    .message("Delete failed: " + e.getMessage())
                    .build();
        }
    }
}

