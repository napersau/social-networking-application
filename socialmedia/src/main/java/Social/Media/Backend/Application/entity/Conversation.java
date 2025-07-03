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
@Table(name = "conversation")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "type")
    String type; // GROUP, DIRECT

    @Column(name = "participants_hash", unique = true)
    String participantsHash;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    List<ParticipantInfo> participants;

    @Column(name = "created_date")
    Instant createdDate;

    @Column(name = "modified_date")
    Instant modifiedDate;
}