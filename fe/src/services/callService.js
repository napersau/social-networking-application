/**
 * Call Service - Xử lý cuộc gọi thoại và video call
 * Sử dụng WebRTC và Socket.IO
 */

class CallService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.callLogId = null;
    this.socket = null;
    
    // WebRTC Configuration
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };
  }

  /**
   * Khởi tạo socket connection
   */
  setSocket(socket) {
    this.socket = socket;
  }

  /**
   * Tạo PeerConnection
   */
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Khi có ICE candidate
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc-signal', {
          targetUserId: this.targetUserId,
          payload: {
            type: 'candidate',
            candidate: event.candidate
          }
        });
      }
    };

    // Khi nhận được remote stream
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      }
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };
  }

  /**
   * Bắt đầu cuộc gọi (Caller)
   * @param {Object} options - { targetUserId, conversationId, callType: 'VOICE' | 'VIDEO' }
   */
  async startCall(options) {
    const { targetUserId, conversationId, callType } = options;
    this.targetUserId = targetUserId;
    this.callType = callType;

    try {
      // 1. Lấy media stream
      this.localStream = await this.getLocalStream(callType === 'VIDEO');

      // 2. Tạo peer connection
      this.createPeerConnection();

      // 3. Thêm local tracks vào peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // 4. GỬI INVITE CALL TRƯỚC (để người nhận thấy UI)
      console.log('📞 Sending invite-call to:', targetUserId);
      this.socket.emit('invite-call', {
        targetUserId,
        conversationId,
        callType,
      });

      // 5. Tạo offer và gửi sau khi người nhận accept
      // Offer sẽ được tạo khi nhận event 'call-accepted'
      
      return this.localStream;
    } catch (error) {
      console.error('Error starting call:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Chấp nhận cuộc gọi (Receiver)
   * @param {Object} options - { callLogId, targetUserId, callType }
   */
  async acceptCall(options) {
    const { callLogId, targetUserId, callType } = options;
    this.callLogId = callLogId;
    this.targetUserId = targetUserId;
    this.callType = callType;

    try {
      // 1. Lấy media stream
      this.localStream = await this.getLocalStream(callType === 'VIDEO');

      // 2. Tạo peer connection
      this.createPeerConnection();

      // 3. Thêm local tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // 4. Gửi accept call qua socket
      this.socket.emit('accept-call', {
        targetUserId,
        callLogId
      });

      return this.localStream;
    } catch (error) {
      console.error('Error accepting call:', error);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Xử lý WebRTC signal từ peer
   */
  async handleWebRTCSignal(payload) {
    try {
      if (!this.peerConnection) {
        console.error('PeerConnection not initialized');
        return;
      }

      if (payload.type === 'offer') {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(payload.offer)
        );
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Gửi answer về
        this.socket.emit('webrtc-signal', {
          targetUserId: this.targetUserId,
          payload: {
            type: 'answer',
            answer: answer
          }
        });
      } else if (payload.type === 'answer') {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(payload.answer)
        );
      } else if (payload.type === 'candidate') {
        await this.peerConnection.addIceCandidate(
          new RTCIceCandidate(payload.candidate)
        );
      }
    } catch (error) {
      console.error('Error handling WebRTC signal:', error);
    }
  }

  /**
   * Từ chối cuộc gọi
   */
  declineCall(callLogId, targetUserId) {
    this.socket.emit('decline-call', {
      callLogId,
      targetUserId
    });
    this.cleanup();
  }

  /**
   * Kết thúc cuộc gọi
   */
  hangUp(callLogId, targetUserId, duration, status = 'COMPLETED') {
    this.socket.emit('hang-up', {
      callLogId,
      targetUserId,
      duration,
      status
    });
    this.cleanup();
  }

  /**
   * Lấy local media stream
   */
  async getLocalStream(includeVideo = false) {
    console.log('🎥 getLocalStream called with includeVideo:', includeVideo);
    
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: includeVideo ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      } : false
    };

    console.log('📋 Media constraints:', constraints);

    try {
      console.log('⏳ Requesting getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Stream obtained:', stream);
      console.log('📊 Audio tracks:', stream.getAudioTracks().length);
      console.log('📊 Video tracks:', stream.getVideoTracks().length);
      return stream;
    } catch (error) {
      console.error('❌ Error getting local stream:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Nếu video bị lỗi (device in use, not found, etc), fallback về audio-only
      if (includeVideo && error.name !== 'NotAllowedError') {
        console.warn('⚠️ Video failed, falling back to audio-only...');
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            audio: constraints.audio,
            video: false
          });
          console.log('✅ Fallback to audio-only successful');
          alert('⚠️ Không thể truy cập camera. Cuộc gọi sẽ chỉ có âm thanh.');
          return audioOnlyStream;
        } catch (audioError) {
          console.error('❌ Audio-only fallback also failed:', audioError);
          throw audioError;
        }
      }
      
      // Throw original error nếu không thể fallback
      throw error;
    }
  }

  /**
   * Toggle mute/unmute audio
   */
  toggleAudio(muted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  /**
   * Toggle on/off video
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Stop remote stream
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.callLogId = null;
    this.targetUserId = null;
  }
}

export default new CallService();
