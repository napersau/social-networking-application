package Social.Media.Backend.Application.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "chat_message")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @Column(name = "message")
    String message;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    ParticipantInfo sender;

    @Column(name = "created_date")
    Instant createdDate;

    @Column(name = "is_read")
    Boolean isRead = false;

    @Column(name = "is_recalled")
    Boolean isRecalled = false;

}