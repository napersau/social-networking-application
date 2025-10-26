import React, { useState, useEffect } from 'react';
import { Modal, Button, Avatar, Space } from 'antd';
import {
  PhoneOutlined,
  VideoCameraOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import callService from '../../services/callService';
import './IncomingCallModal.css';

const IncomingCallModal = ({
  visible,
  onAccept,
  onDecline,
  callData, // { callLogId, callerId, callerName, callerAvatar, callType }
  socket,
}) => {
  const [ringing, setRinging] = useState(true);
  const audioRef = React.useRef(null);

  useEffect(() => {
    if (visible && audioRef.current) {
      // Play ringtone
      audioRef.current.play().catch(err => console.error('Error playing ringtone:', err));
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [visible]);

  const handleAccept = async () => {
    setRinging(false);
    
    try {
      // Setup call service
      callService.setSocket(socket);
      
      const localStream = await callService.acceptCall({
        callLogId: callData.callLogId,
        targetUserId: callData.callerId,
        callType: callData.callType,
      });

      onAccept(localStream);
    } catch (error) {
      console.error('Error accepting call:', error);
      handleDecline();
    }
  };

  const handleDecline = () => {
    setRinging(false);
    callService.declineCall(callData.callLogId, callData.callerId);
    onDecline();
  };

  if (!callData) return null;

  return (
    <>
      {/* Ringtone Audio */}
      <audio ref={audioRef} loop>
        <source src="/ringtone.mp3" type="audio/mpeg" />
      </audio>

      <Modal
        open={visible}
        onCancel={handleDecline}
        footer={null}
        closable={false}
        width={400}
        className="incoming-call-modal"
        centered
      >
        <div className="incoming-call-container">
          {/* Caller Info */}
          <div className="caller-info">
            <Avatar
              src={callData.callerAvatar}
              size={120}
              className={`caller-avatar ${ringing ? 'ringing-animation' : ''}`}
            />
            <h2 className="caller-name">{callData.callerName}</h2>
            <p className="call-type-text">
              {callData.callType === 'VIDEO' ? (
                <>
                  <VideoCameraOutlined /> Cuộc gọi video đến
                </>
              ) : (
                <>
                  <PhoneOutlined /> Cuộc gọi thoại đến
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="call-actions">
            <Space size="large">
              {/* Decline Button */}
              <Button
                type="primary"
                danger
                shape="circle"
                size="large"
                icon={<CloseOutlined />}
                onClick={handleDecline}
                className="decline-btn"
              />

              {/* Accept Button */}
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={
                  callData.callType === 'VIDEO' ? (
                    <VideoCameraOutlined />
                  ) : (
                    <PhoneOutlined />
                  )
                }
                onClick={handleAccept}
                className="accept-btn"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              />
            </Space>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default IncomingCallModal;
