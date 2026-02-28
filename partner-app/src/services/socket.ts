import { io, Socket } from 'socket.io-client';

const TRACKING_URL = 'http://localhost:3005';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(TRACKING_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function isConnected(): boolean {
  return socket?.connected || false;
}
