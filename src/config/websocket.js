// config/websocket.js
import io from 'socket.io-client';

const SOCKET_URL = 'http://172.17.176.1:5050';

export const initializeSocket = (userId) => {
  const socket = io(SOCKET_URL, {
    query: { userId },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
    transports: ['websocket', 'polling'],
    forceNew: true
  });

  return socket;
};