package Social.Media.Backend.Application.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "invalidated_token")
public class InvalidatedToken {
    @Id
    private String id;

    @Column(name = "expiry_time")
    private Date expiryTime;
}
