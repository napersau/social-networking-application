package Social.Media.Backend.Application.scheduler;

import Social.Media.Backend.Application.service.TypingStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TypingStatusScheduler {
    
    private final TypingStatusService typingStatusService;
    
    @Scheduled(fixedRate = 5000) // Run every 5 seconds
    public void cleanupExpiredTypingStatus() {
        try {
            typingStatusService.cleanupExpiredTypingStatus();
        } catch (Exception e) {
            log.error("Error in typing status cleanup scheduler", e);
        }
    }
}