package Social.Media.Backend.Application.enums;

import lombok.Data;

public enum CallStatus {
    COMPLETED, // Hoàn thành
    MISSED,    // Bị lỡ
    DECLINED,  // Bị từ chối
    CANCELLED , // Người gọi hủy trước khi có trả lời
    RINGING

}
