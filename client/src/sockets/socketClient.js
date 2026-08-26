import { io } from 'socket.io-client';
import { getToken } from '../utils/storage';

let socket = null;

function getSocketUrl() {
  return process.env.VITE_API_URL || undefined;
}

export function getSocket() {
  return socket;
}

export function connectSocket() {
  const token = getToken();
  if (!token) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(getSocketUrl(), {
    autoConnect: true,
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function refreshSocketAuth() {
  const token = getToken();
  if (!token) {
    disconnectSocket();
    return null;
  }
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }
  return connectSocket();
}
