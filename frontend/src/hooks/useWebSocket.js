import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function useWebSocket(rfqId, onUpdate) {
  const socketRef = useRef(null);
  const callbackRef = useRef(onUpdate);

  // Keep callback fresh to avoid closure staleness
  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    // Determine the base URL without /api at the end for socket.io
    const baseUrl = SOCKET_URL.replace(/\/api$/, '');
    
    socketRef.current = io(baseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to socket', socket.id);
      if (rfqId) {
        socket.emit('rfq:join', rfqId);
      }
    });

    const eventName = rfqId ? 'rfq:updated' : 'rfq:global:updated';

    socket.on(eventName, (data) => {
      // If we are listening to a specific rfq, ensure the ID matches just in case
      if (rfqId && data.rfqId !== rfqId) return;
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    });

    return () => {
      if (rfqId) {
        socket.emit('rfq:leave', rfqId);
      }
      socket.disconnect();
    };
  }, [rfqId]);

  return socketRef.current;
}
