import React, { createContext, useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import { UserContext } from './UserContext'; // Import UserContext to get the token
import { API_BASE_URL } from '../constants/config'; // Ensure this points to your backend URL

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useContext(UserContext); // Get the token!
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. If we don't have a token or user, disconnect any existing socket
    if (!token || !user) {
      if (socket) {
        console.log("🔌 User logged out. Disconnecting socket...");
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // 2. Prevent duplicate connections if socket already exists and is connected
    if (socket && socket.connected) return;

    // 3. Initialize Socket with Auth Token
    console.log("🔌 Initializing Socket for user:", user.name);

    const newSocket = io(API_BASE_URL, {
      transports: ['websocket'], // Force websocket for better performance in RN
      auth: {
        token: token, // Standard Way (Socket.io v3+)
      },
      query: {
        token: token, // Fallback Way (If your backend looks at query params)
      },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    // 4. Global Event Listeners (Debug)
    newSocket.on('connect', () => {
      console.log(`✅ Socket Connected! ID: ${newSocket.id}`);
      
      // OPTIONAL: Explicitly join the user's own room if your backend requires it
      // newSocket.emit('join_room', user._id); 
    });

    newSocket.on('connect_error', (err) => {
      console.error(`❌ Socket Connection Error: ${err.message}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`⚠️ Socket Disconnected: ${reason}`);
    });

    setSocket(newSocket);

    // 5. Cleanup on Unmount or Token Change
    return () => {
      newSocket.disconnect();
    };

  }, [token]); // Re-run this logic whenever the Auth Token changes

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};