import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = (userId: string): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('join_user', userId);
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
