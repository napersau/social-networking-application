package Social.Media.Backend.Application.entity;

import Social.Media.Backend.Application.enums.CallStatus;
import Social.Media.Backend.Application.enums.CallType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "call_logs")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CallLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người gọi
    @ManyToOne
    @JoinColumn(name = "caller_id", nullable = false)
    private User caller;

    // Người nhận
    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    // Thời gian bắt đầu cuộc gọi (khi người gọi bấm nút gọi)
    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    // Thời gian kết thúc cuộc gọi (khi một trong hai ngắt máy)
    @Column(name = "end_time")
    private Instant endTime;

    // Thời lượng cuộc gọi (tính bằng giây), có thể null nếu là gọi nhỡ
    @Column(name = "duration_in_seconds")
    private Long durationInSeconds;

    // Trạng thái cuộc gọi
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CallStatus status;

    // Loại cuộc gọi
    @Enumerated(EnumType.STRING)
    @Column(name = "call_type", nullable = false)
    private CallType callType;

}

