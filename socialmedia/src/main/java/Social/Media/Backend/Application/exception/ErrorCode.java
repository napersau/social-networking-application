package Social.Media.Backend.Application.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized Error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message Key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least 3 characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1004, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    PRODUCT_EXISTED(1008, "Product existed", HttpStatus.BAD_REQUEST),
    CONVERSATION_NOT_FOUND(1009, "Chat conversation not found", HttpStatus.NOT_FOUND),
    POST_NOT_EXISTED(1010, "Post not existed", HttpStatus.NOT_FOUND),
    MESSAGE_NOT_FOUND(1011, "Message not existed", HttpStatus.NOT_FOUND),
    USER_ALREADY_IN_CONVERSATION(1012, "User already in conversation", HttpStatus.BAD_REQUEST),
    USER_NOT_IN_CONVERSATION(1014, "User not in conversation", HttpStatus.BAD_REQUEST),
    POST_SHARE_NOT_EXISTED(1015, "Post share not existed", HttpStatus.NOT_FOUND),
    CALL_LOG_NOT_EXISTED(1016, "Call log not existed", HttpStatus.NOT_FOUND)
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;

}
