package Social.Media.Backend.Application.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "participant_info")
public class ParticipantInfo {

    @Id
    @Column(name = "user_id")
    Long userId;

    @Column(name = "username")
    String username;

    @Column(name = "first_name")
    String firstName;

    @Column(name = "last_name")
    String lastName;

    @Column(name = "avatar")
    String avatar;

    @ManyToOne
    @JoinColumn(name = "conversation_id") // Tên cột FK trong participant_info
    Conversation conversation;
}
