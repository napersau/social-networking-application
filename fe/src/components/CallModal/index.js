import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Avatar, Space, message } from 'antd';
import {
  PhoneOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import callService from '../../services/callService';
import './CallModal.css';

const CallModal = ({
  visible,
  onClose,
  callType, // 'VOICE' | 'VIDEO'
  targetUser, // { id, name, avatar }
  conversationId,
  socket,
  isCaller, // true nếu là người gọi, false nếu là người nhận
  callLogId,
}) => {
  const [callStatus, setCallStatus] = useState('connecting'); // connecting | ringing | connected | ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'VIDEO');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionState, setConnectionState] = useState('new');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    // Setup call service
    callService.setSocket(socket);
    callService.onRemoteStream = handleRemoteStream;
    callService.onConnectionStateChange = handleConnectionStateChange;

    if (isCaller) {
      initiateCall();
    }

    // Socket event listeners
    socket.on('call-accepted', handleCallAccepted);
    socket.on('webrtc-signal', handleWebRTCSignal);
    socket.on('call-declined', handleCallDeclined);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('call-accepted', handleCallAccepted);
      socket.off('webrtc-signal', handleWebRTCSignal);
      socket.off('call-declined', handleCallDeclined);
      socket.off('call-ended', handleCallEnded);
      
      stopTimer();
      callService.cleanup();
    };
  }, [visible]);

  const initiateCall = async () => {
    try {
      setCallStatus('ringing');
      const localStream = await callService.startCall({
        targetUserId: targetUser.id,
        conversationId,
        callType,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    } catch (error) {
      message.error(error.message || 'Không thể bắt đầu cuộc gọi');
      handleHangUp();
    }
  };

  const handleCallAccepted = async () => {
    setCallStatus('connected');
    startTimer();
  };

  const handleWebRTCSignal = async (payload) => {
    await callService.handleWebRTCSignal(payload);
  };

  const handleCallDeclined = () => {
    message.warning('Cuộc gọi bị từ chối');
    setCallStatus('ended');
    setTimeout(() => onClose(), 1500);
  };

  const handleCallEnded = () => {
    setCallStatus('ended');
    stopTimer();
    setTimeout(() => onClose(), 1500);
  };

  const handleRemoteStream = (stream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  };

  const handleConnectionStateChange = (state) => {
    setConnectionState(state);
    if (state === 'connected') {
      setCallStatus('connected');
      if (!callStartTimeRef.current) {
        startTimer();
      }
    } else if (state === 'disconnected' || state === 'failed') {
      setCallStatus('ended');
      stopTimer();
    }
  };

  const startTimer = () => {
    callStartTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      setCallDuration(elapsed);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    callService.toggleAudio(newMuted);
  };

  const handleToggleVideo = () => {
    const newEnabled = !isVideoEnabled;
    setIsVideoEnabled(newEnabled);
    callService.toggleVideo(newEnabled);
  };

  const handleHangUp = () => {
    const duration = callDuration;
    const status = callStatus === 'connected' ? 'COMPLETED' : 'MISSED';
    
    callService.hangUp(callLogId, targetUser.id, duration, status);
    setCallStatus('ended');
    stopTimer();
    
    setTimeout(() => onClose(), 500);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Đang kết nối...';
      case 'ringing':
        return 'Đang gọi...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Cuộc gọi đã kết thúc';
      default:
        return '';
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={handleHangUp}
      footer={null}
      closable={false}
      width={callType === 'VIDEO' ? 800 : 400}
      className="call-modal"
      centered
    >
      <div className={`call-container ${callType.toLowerCase()}-call`}>
        {/* Video Call Layout */}
        {callType === 'VIDEO' && (
          <div className="video-container">
            {/* Remote Video (người bên kia) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
            
            {/* Local Video (bạn) */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
            />
          </div>
        )}

        {/* Voice Call Layout */}
        {callType === 'VOICE' && (
          <div className="voice-call-info">
            <Avatar
              src={targetUser.avatar}
              size={120}
              className="caller-avatar"
            />
            <h2 className="caller-name">{targetUser.name}</h2>
          </div>
        )}

        {/* Call Info */}
        <div className="call-info">
          <div className="call-status">{getStatusText()}</div>
          {connectionState !== 'connected' && callStatus === 'connected' && (
            <div className="connection-status">Đang kết nối lại...</div>
          )}
        </div>

        {/* Controls */}
        <div className="call-controls">
          <Space size="large">
            {/* Mute/Unmute */}
            <Button
              type={isMuted ? 'primary' : 'default'}
              shape="circle"
              size="large"
              icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
              onClick={handleToggleMute}
              className={isMuted ? 'muted-btn' : ''}
            />

            {/* Video On/Off (chỉ hiện với VIDEO call) */}
            {callType === 'VIDEO' && (
              <Button
                type={!isVideoEnabled ? 'primary' : 'default'}
                shape="circle"
                size="large"
                icon={<VideoCameraOutlined />}
                onClick={handleToggleVideo}
                className={!isVideoEnabled ? 'video-off-btn' : ''}
              />
            )}

            {/* Hang Up */}
            <Button
              type="primary"
              danger
              shape="circle"
              size="large"
              icon={<PhoneOutlined rotate={135} />}
              onClick={handleHangUp}
              className="hangup-btn"
            />
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default CallModal;
