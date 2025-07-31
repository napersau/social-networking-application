package Social.Media.Backend.Application.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "message_reaction")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    ChatMessage message;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "reaction_type", nullable = false)
    String reactionType;

    @Column(name = "created_at")
    Instant createdAt;
}
