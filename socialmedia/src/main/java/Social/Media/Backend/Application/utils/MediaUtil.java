package Social.Media.Backend.Application.utils;

import Social.Media.Backend.Application.dto.response.MediaResponse;
import Social.Media.Backend.Application.entity.Media;
import Social.Media.Backend.Application.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MediaUtil {
    private final MediaRepository mediaRepository;
    private final ModelMapper modelMapper;

    public void createMediaList(List<String> mediaUrls, Long sourceId, String sourceType) {
        for (String mediaUrl : mediaUrls) {
            Media media = Media.builder()
                    .url(mediaUrl)
                    .sourceId(sourceId)
                    .sourceType(sourceType)
                    .type("image")
                    .createdDate(Instant.now())
                    .build();
            mediaRepository.save(media);
        }
    }
}
