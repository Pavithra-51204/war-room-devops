import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socketInstance = null; // module-level singleton

export const useSocket = () => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(socketInstance);
  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;

    if (!token) {
      // Disconnect if logged out
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        setSocket(null);
      }
      return;
    }

    if (socketInstance?.connected) return; // already live

    const s = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    s.on('connect',         () => console.info('[socket] connected:', s.id));
    s.on('disconnect',      (r) => console.warn('[socket] disconnected:', r));
    s.on('connect_error',   (e) => console.error('[socket] error:', e.message));

    socketInstance = s;
    setSocket(s);

    return () => {
      // Do NOT disconnect on unmount – keep alive for the session.
      // Clean up only when token changes (handled above).
    };
  }, [token]);

  return socket;
};
