package Social.Media.Backend.Application.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "post_shares")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostShare {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "shared_content")
    private String sharedContent;
}
