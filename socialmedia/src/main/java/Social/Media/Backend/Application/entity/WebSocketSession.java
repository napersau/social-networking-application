package Social.Media.Backend.Application.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "web_socket_session")
public class WebSocketSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "socket_session_id")
    private String socketSessionId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "created_at")
    private Instant createdAt;
}
