// src/services/webSocketService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  connect(onMessageReceived, onError) {
    const socket = new SockJS('http://localhost:8080/ws');
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      this.connected = true;
      
      // Subscribe to private messages
      this.client.subscribe('/user/queue/messages', (message) => {
        const receivedMessage = JSON.parse(message.body);
        onMessageReceived(receivedMessage);
      });

      // Subscribe to typing indicators
      this.client.subscribe('/user/queue/typing', (message) => {
        const typingData = JSON.parse(message.body);
        onMessageReceived(typingData);
      });

      // Subscribe to errors
      this.client.subscribe('/user/queue/errors', (message) => {
        const errorData = JSON.parse(message.body);
        onError(errorData);
      });

      // Add user to online users
      this.client.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify({})
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      onError(frame);
    };

    this.client.activate();
  }

  sendMessage(messageData) {
    if (this.client && this.connected) {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messageData)
      });
    }
  }

  sendTyping(conversationId) {
    if (this.client && this.connected) {
      this.client.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({ conversationId })
      });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }
}

export default WebSocketService;