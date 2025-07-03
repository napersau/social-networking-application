package Social.Media.Backend.Application.exception;

import Social.Media.Backend.Application.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

//@RestControllerAdvice
//public class GlobalExceptionHandler {
//    @ExceptionHandler(value = Exception.class)
//    ResponseEntity<ApiResponse> runtimeExceptionHandler(RuntimeException ex) {
//        ApiResponse apiResponse = new ApiResponse();
//        apiResponse.setMessage(ex.getMessage());
//        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
//        return ResponseEntity.badRequest().body(apiResponse);
//    }
//
//    @ExceptionHandler(value = AppException.class)
//    ResponseEntity<ApiResponse> handlingAppException(AppException ex) {
//
//        ErrorCode errorCode = ex.getErrorCode();
//        ApiResponse apiResponse = new ApiResponse();
//
//        apiResponse.setMessage(errorCode.getMessage());
//        apiResponse.setCode(errorCode.getCode());
//        return ResponseEntity
//                .status(errorCode.getStatusCode())
//                .body(apiResponse);
//    }
//
//    @ExceptionHandler(value = AccessDeniedException.class)
//    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException ex) {
//        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
//        return ResponseEntity.status(errorCode.getStatusCode()).body(
//                ApiResponse.builder()
//                        .code(errorCode.getCode())
//                        .message(errorCode.getMessage())
//                        .build()
//        );
//    }
//
//
//    @ExceptionHandler(value = MethodArgumentNotValidException.class)
//    ResponseEntity<ApiResponse> handlingValidation(MethodArgumentNotValidException ex) {
//        String enumKey = ex.getFieldError().getDefaultMessage();
//        ErrorCode errorCode = ErrorCode.INVALID_KEY;
//
//        try{
//            errorCode = ErrorCode.valueOf(enumKey);
//        } catch (IllegalArgumentException e) {
//            System.err.println("Invalid enum key from validation: " + enumKey);
//
//        }
//
//        ApiResponse apiResponse = new ApiResponse();
//
//        apiResponse.setMessage(errorCode.getMessage());
//        apiResponse.setCode(errorCode.getCode());
//        return ResponseEntity.badRequest().body(apiResponse);
//
//    }
//}

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý các exception chung
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception ex) {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage(ex.getMessage());
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        return ResponseEntity.internalServerError().body(apiResponse);
    }

    // Xử lý các exception cụ thể của ứng dụng
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage(errorCode.getMessage());
        apiResponse.setCode(errorCode.getCode());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    // Xử lý khi truy cập bị từ chối
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDeniedException(AccessDeniedException ex) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()
        );
    }

    // Xử lý validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String enumKey = ex.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_KEY;

        try {
            errorCode = ErrorCode.valueOf(enumKey);
        } catch (IllegalArgumentException e) {
            System.err.println("Không tìm thấy mã lỗi tương ứng: " + enumKey);
        }

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage(errorCode.getMessage());
        apiResponse.setCode(errorCode.getCode());
        return ResponseEntity.badRequest().body(apiResponse);
    }
}