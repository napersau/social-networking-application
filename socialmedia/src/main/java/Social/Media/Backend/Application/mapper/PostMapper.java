package Social.Media.Backend.Application.mapper;


import Social.Media.Backend.Application.dto.response.PostResponse;
import Social.Media.Backend.Application.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CommentMapper.class})
public interface PostMapper {

    PostResponse toPostResponse(Post post);
}
