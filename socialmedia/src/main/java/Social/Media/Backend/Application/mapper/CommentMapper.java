package Social.Media.Backend.Application.mapper;

import Social.Media.Backend.Application.dto.response.CommentResponse;
import Social.Media.Backend.Application.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    @Mapping(source = "post.id", target = "postId")
    @Mapping(source = "postShare.id", target = "postShareId")
    @Mapping(source = "parentComment.id", target = "parentCommentId")
    CommentResponse toCommentResponse(Comment comment);
}
