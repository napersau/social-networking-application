package Social.Media.Backend.Application.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url")
    private String imageUrl; // Có thể là chuỗi JSON hoặc URL cách nhau bằng dấu phẩy

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "location")
    private String location;

    @Column(name = "privacy")
    private String privacy;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "likes_count")
    private Integer likesCount;

    @Column(name = "comments_count")
    private Integer commentsCount;

    @Column(name = "shares_count")
    private Integer sharesCount;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes;
}
