package Social.Media.Backend.Application.service;

import Social.Media.Backend.Application.dto.request.CallLogRequest;
import Social.Media.Backend.Application.dto.response.CallLogResponse;

import java.util.List;

public interface CallLogService {

    CallLogResponse createCallLog(CallLogRequest callLogRequest);
    CallLogResponse updateCallLog(CallLogRequest callLogRequest, Long id);
    List<CallLogResponse> getCallLogs(CallLogRequest callLogRequest);
    List<CallLogResponse> getMissedCallLogs();

}
