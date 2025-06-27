package Social.Media.Backend.Application.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // Nếu null không show
public class ApiResponse<T> {
    public static Object List;
    private int code = 1000;
    private String message;
    private T result;
    private int totalPages;

}
