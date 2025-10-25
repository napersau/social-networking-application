package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.CallLogRequest;
import Social.Media.Backend.Application.dto.response.CallLogResponse;
import Social.Media.Backend.Application.entity.CallLog;
import Social.Media.Backend.Application.entity.Conversation;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.CallLogRepository;
import Social.Media.Backend.Application.repository.ConversationRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.CallLogService;
import Social.Media.Backend.Application.utils.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CallLogServiceImpl implements CallLogService {

    private final CallLogRepository callLogRepository;
    private final ModelMapper modelMapper;
    private final SecurityUtil securityUtil;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;

    @Override
    public CallLogResponse createCallLog(CallLogRequest callLogRequest) {

        Conversation conversation = conversationRepository.findById(callLogRequest.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        User caller = userRepository.findById(callLogRequest.getCallerId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        User receiver = userRepository.findById(callLogRequest.getReceiverId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        CallLog callLog = CallLog.builder()
                .callType(callLogRequest.getCallType())
                .startTime(Instant.now())
                .status(callLogRequest.getStatus())
                .caller(caller)
                .receiver(receiver)
                .conversation(conversation)
                .build();

        callLogRepository.save(callLog);
        return modelMapper.map(callLog, CallLogResponse.class);
    }

    @Override
    public CallLogResponse updateCallLog(CallLogRequest callLogRequest, Long id) {
        CallLog callLog = callLogRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CALL_LOG_NOT_EXISTED));
        callLog.setStatus(callLogRequest.getStatus());
        callLog.setEndTime(Instant.now());
        callLogRepository.save(callLog);
        return modelMapper.map(callLog, CallLogResponse.class);
    }

    @Override
    public List<CallLogResponse> getCallLogs(CallLogRequest callLogRequest) {
        List<CallLog> callLogs = callLogRepository.findCallLogsByConversation(callLogRequest.getConversationId());
        return callLogs.stream().map(callLog -> modelMapper.map(callLog, CallLogResponse.class)).toList();
    }

    @Override
    public List<CallLogResponse> getMissedCallLogs() {
        return List.of();
    }
}
