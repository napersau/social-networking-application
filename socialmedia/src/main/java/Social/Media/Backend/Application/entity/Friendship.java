package Social.Media.Backend.Application.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Date;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "friendships")

public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người gửi lời mời
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Người nhận lời mời
    @ManyToOne
    @JoinColumn(name = "friend_id")
    private User friend;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
