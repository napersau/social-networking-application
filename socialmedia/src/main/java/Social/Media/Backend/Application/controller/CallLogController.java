package Social.Media.Backend.Application.controller;


import Social.Media.Backend.Application.dto.request.CallLogRequest;
import Social.Media.Backend.Application.dto.response.ApiResponse;
import Social.Media.Backend.Application.dto.response.CallLogResponse;
import Social.Media.Backend.Application.service.CallLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/call/logs")
public class CallLogController {

    private final CallLogService callLogService;

    @PostMapping("/create")
    ApiResponse<CallLogResponse> createCallLog(@RequestBody CallLogRequest request) {
        CallLogResponse response = callLogService.createCallLog(request);
        return ApiResponse.<CallLogResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }
}
