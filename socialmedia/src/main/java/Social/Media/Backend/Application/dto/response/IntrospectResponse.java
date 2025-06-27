package Social.Media.Backend.Application.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class IntrospectResponse {
    private boolean valid;
}
